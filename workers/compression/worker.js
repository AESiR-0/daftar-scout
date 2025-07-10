require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { Client } = require('pg');
const AWS = require('aws-sdk');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const os = require('os');

// --- ENV VALIDATION ---
const REQUIRED_ENV = [
  'PG_HOST', 'PG_PORT', 'PG_USER', 'PG_PASSWORD', 'PG_DATABASE',
  'AWS_REGION', 'AWS_S3_BUCKET_NAME', 'WS_SERVER'
];

const PG_CONFIG = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('../../global-bundle.pem').toString(), // Use the cert bundle here
  },
};
const S3 = new AWS.S3({ region: process.env.AWS_REGION });
var WS_SERVER = "ws://localhost:4000";
const TMP_DIR = os.tmpdir();
const BUCKET = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET;

// --- DB ---
const pg = new Client(PG_CONFIG);
pg.connect();
pg.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] PostgreSQL error:`, err);
  process.exit(1);
});

// --- WebSocket ---
let ws;
function connectWS() {
  ws = new WebSocket(WS_SERVER);
  ws.on('open', () => log('WebSocket connected'));
  ws.on('close', () => setTimeout(connectWS, 2000));
  ws.on('error', (err) => { log('WebSocket error: ' + err.message); ws.close(); });
}
connectWS();

// --- Logging helper ---
function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

// --- Startup checks ---
async function startupChecks() {
  // Check ffmpeg
  log('Checking ffmpeg presence...');
  try {
    await new Promise((res, rej) => {
      const ffmpeg = spawn('ffmpeg', ['-version']);
      ffmpeg.on('error', rej);
      ffmpeg.on('close', (code) => code === 0 ? res() : rej(new Error('ffmpeg not found or not working')));
    });
    log('ffmpeg is present.');
  } catch (e) {
    log('ffmpeg is not installed or not in PATH:', e.message);
    process.exit(1);
  }
  // Check S3 connectivity
  log('Checking S3 connectivity...');
  try {
    await S3.listBuckets().promise();
    log('S3 connectivity OK.');
  } catch (e) {
    log('S3 connectivity failed:', e.message);
    process.exit(1);
  }
}

async function checkPendingJobs() {
  const { rows } = await pg.query("SELECT * FROM video_jobs WHERE status = 'pending'");
  for (const job of rows) {
    await processJob(job);
  }
}
checkPendingJobs();

startupChecks().then(() => {
  checkPendingJobs()
});


const JOB_CHANNEL = 'new_video_job';
pg.query(`LISTEN ${JOB_CHANNEL}`);
pg.on('notification', async (msg) => {
  if (msg.channel === JOB_CHANNEL) {
    const jobId = msg.payload;
    log(`[compression] Received notification for job: ${jobId}`);
    // Fetch the job from DB and process it
    const { rows } = await pg.query("SELECT * FROM video_jobs WHERE job_id = $1", [jobId]);
    if (rows.length) {
      await processJob(rows[0]);
    }
  }
});

// async function pollJobs() {
//   try {
//     log('Polling for jobs...');
//     const { rows } = await pg.query(
//       "SELECT * FROM video_jobs WHERE status = 'pending' LIMIT 1"
//     );
//     log('Poll result:', rows.length, rows[0]?.job_id);
//     if (rows.length) {
//       const job = rows[0];
//       log(`[compression] Found pending job: ${job.job_id}`);
//       await processJob(job);
//     } else {
//       log('[compression] No pending jobs found.');
//     }
//   } catch (e) {
//     log('Polling error:', e);
//   }
//   setTimeout(pollJobs, 5000);
// }

// --- S3 upload with retry ---
async function uploadToS3WithRetry(params, maxRetries = 3) {
  let attempt = 0;
  let lastErr;
  while (attempt < maxRetries) {
    try {
      return await S3.upload(params).promise();
    } catch (err) {
      lastErr = err;
      log(`S3 upload failed (attempt ${attempt + 1}):`, err.message);
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt))); // Exponential backoff
      attempt++;
    }
  }
  throw lastErr;
}

// --- Process a job ---
async function processJob(job) {
  let inputPath, outputDir;
  try {
    log(`[compression] Processing job: ${job.job_id}`);
    log(`[compression] Setting status to processing for job: ${job.job_id}`);
    await pg.query("UPDATE video_jobs SET status = 'processing' WHERE job_id = $1", [job.job_id]);
    log(`[compression] Status set to processing for job: ${job.job_id}`);
    inputPath = path.join(TMP_DIR, `${job.job_id}-input`);
    outputDir = path.join(TMP_DIR, `${job.job_id}-hls`);
    fs.mkdirSync(outputDir, { recursive: true });
    log(`[compression] Created output directory: ${outputDir}`);

    // Download from S3
    log(`[compression] Downloading from S3: ${job.s3_key}`);
    await new Promise((res, rej) => {
      log(`[compression] Attempting to get S3 object: Bucket=${BUCKET}, Key=${job.s3_key}`);
      const s3Stream = S3.getObject({ Bucket: BUCKET, Key: job.s3_key }).createReadStream();
      const fileStream = fs.createWriteStream(inputPath);

      s3Stream.on('error', (err) => {
        log(`[compression] S3 stream error: ${err.message}`);
        rej(err);
      });
      fileStream.on('error', (err) => {
        log(`[compression] File stream error: ${err.message}`);
        rej(err);
      });
      fileStream.on('finish', () => {
        log(`[compression] File stream finished writing: ${inputPath}`);
        res();
      });
      s3Stream.pipe(fileStream);
    });
    log(`[compression] Downloaded to: ${inputPath}`);

    // Run FFmpeg
    log(`[compression] Starting ffmpeg for job: ${job.job_id}`);
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '28',
      '-c:a', 'aac', '-b:a', '96k',
      '-f', 'hls', '-hls_time', '6', '-hls_playlist_type', 'vod',
      '-hls_segment_filename', path.join(outputDir, 'output_%03d.ts'),
      path.join(outputDir, 'output.m3u8')
    ]);
    log(`[compression] FFmpeg process started for job: ${job.job_id}`);

    let lastLogTime = 0;
    const LOG_THROTTLE_MS = 300; // Only send logs every 300ms
    const MAX_LOG_LENGTH = 500; // Truncate logs to 500 chars

    ffmpeg.stdout.on('data', (data) => {
      const now = Date.now();
      if (now - lastLogTime > LOG_THROTTLE_MS) {
        sendLog(job.job_id, truncateLog(data.toString()));
        lastLogTime = now;
      }
    });
    ffmpeg.stderr.on('data', (data) => {
      const now = Date.now();
      if (now - lastLogTime > LOG_THROTTLE_MS) {
        sendLog(job.job_id, truncateLog(data.toString()));
        lastLogTime = now;
      }
    });
    ffmpeg.on('error', (err) => {
      log('FFmpeg process error:', err.message);
      sendLog(job.job_id, 'FFmpeg process error: ' + err.message, true);
      throw err;
    });

    await new Promise((res, rej) => {
      ffmpeg.on('close', (code) => code === 0 ? res() : rej(new Error('FFmpeg failed')));
    });
    log(`[compression] ffmpeg finished for job: ${job.job_id}`);

    // Upload HLS files to S3
    log(`[compression] Reading HLS output directory: ${outputDir}`);
    const files = fs.readdirSync(outputDir);
    let hlsUrl = "";
    const m3u8File = files.find(f => f.endsWith('.m3u8'));
    if (!m3u8File) throw new Error('No .m3u8 file found in HLS output');
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const s3Key = `hls/${job.job_id}/${file}`;
      log(`[compression] Uploading file to S3: ${s3Key}`);
      await uploadToS3WithRetry({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fs.createReadStream(filePath),
        ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T'
      });
      log(`[compression] Uploaded HLS file to S3: ${s3Key}`);
      if (file === m3u8File) {
        hlsUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      }
    }

    // Update DB
    log(`[compression] Marking job as complete in DB: ${job.job_id}`);
    await pg.query("UPDATE video_jobs SET status = 'complete', completed_at = NOW() WHERE job_id = $1", [job.job_id]);
    log(`[compression] Marked job as complete: ${job.job_id}`);
    if (job.scout_id) {
      log(`[compression] Updating scouts table for scout_id: ${job.scout_id}`);
      await pg.query("UPDATE scouts SET compressed_investor_pitch = $1 WHERE scout_id = $2", [hlsUrl, job.scout_id]);
      log(`[compression] Updated scouts table for scout_id: ${job.scout_id}`);
    }
    if (job.pitch_id) {
      log(`[compression] Updating founder_answers table for pitch_id: ${job.pitch_id}`);
      await pg.query("UPDATE founder_answers SET compressed_pitch_answer_url = $1 WHERE pitch_id = $2", [hlsUrl, job.pitch_id]);
      log(`[compression] Updated founder_answers table for pitch_id: ${job.pitch_id}`);
    }

    sendLog(job.job_id, "Processing complete. HLS URL: " + hlsUrl, true);
    log(`[compression] Processing complete for job: ${job.job_id}`);
  } catch (err) {
    log('Job error:', err);
    console.error(`[compression] Error processing job ${job.job_id}:`, err);
    try {
      log(`[compression] Marking job as failed in DB: ${job.job_id}`);
      await pg.query("UPDATE video_jobs SET status = 'failed' WHERE job_id = $1", [job.job_id]);
      log(`[compression] Marked job as failed: ${job.job_id}`);
    } catch (dbErr) {
      log('Failed to update job status to failed:', dbErr);
    }
    sendLog(job.job_id, "Processing failed: " + err.message, true);
  } finally {
    // Cleanup temp files
    try { if (inputPath) fs.unlinkSync(inputPath); log(`[compression] Cleaned up input: ${inputPath}`); } catch (e) { log('Cleanup input error:', e.message); }
    try { if (outputDir) fs.rmSync(outputDir, { recursive: true, force: true }); log(`[compression] Cleaned up output dir: ${outputDir}`); } catch (e) { log('Cleanup output error:', e.message); }
  }
}

function truncateLog(log) {
  if (log.length > 500) return log.slice(0, 500) + '...';
  return log;
}

// --- Send log to WebSocket ---
function sendLog(jobId, log, done = false) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ jobId, log, done }));
  }
} 