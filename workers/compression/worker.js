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
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[${new Date().toISOString()}] Missing required env vars:`, missing.join(', '));
  process.exit(1);
}

// --- CONFIG ---
const PG_CONFIG = {
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
const S3 = new AWS.S3({ region: process.env.AWS_REGION });
const WS_SERVER = process.env.WS_SERVER || "ws://localhost:4000";
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

// --- Poll for jobs ---
async function pollJobs() {
  try {
    const { rows } = await pg.query(
      "SELECT * FROM video_jobs WHERE status = 'pending' LIMIT 1"
    );
    if (rows.length) {
      const job = rows[0];
      await processJob(job);
    }
  } catch (e) {
    log('Polling error:', e);
  }
  setTimeout(pollJobs, 5000);
}
pollJobs();

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
    await pg.query("UPDATE video_jobs SET status = 'processing' WHERE job_id = $1", [job.job_id]);
    inputPath = path.join(TMP_DIR, `${job.job_id}-input`);
    outputDir = path.join(TMP_DIR, `${job.job_id}-hls`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Download from S3
    await new Promise((res, rej) => {
      const s3Stream = S3.getObject({ Bucket: BUCKET, Key: job.s3_key }).createReadStream();
      const fileStream = fs.createWriteStream(inputPath);
      s3Stream.pipe(fileStream).on('finish', res).on('error', rej);
    });

    // Run FFmpeg
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-f', 'hls', '-hls_time', '6', '-hls_playlist_type', 'vod',
      '-hls_segment_filename', path.join(outputDir, 'output_%03d.ts'),
      path.join(outputDir, 'output.m3u8')
    ]);

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

    // Upload HLS files to S3
    const files = fs.readdirSync(outputDir);
    let hlsUrl = "";
    // Find .m3u8 file explicitly
    const m3u8File = files.find(f => f.endsWith('.m3u8'));
    if (!m3u8File) throw new Error('No .m3u8 file found in HLS output');
    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const s3Key = `hls/${job.job_id}/${file}`;
      await uploadToS3WithRetry({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fs.createReadStream(filePath),
        ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T'
      });
      if (file === m3u8File) {
        hlsUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      }
    }

    // Update DB: set status, set compressedInvestorPitch or compressedPitchAnswerUrl
    await pg.query("UPDATE video_jobs SET status = 'complete', completed_at = NOW() WHERE job_id = $1", [job.job_id]);
    if (job.scout_id) {
      await pg.query("UPDATE scouts SET compressed_investor_pitch = $1 WHERE scout_id = $2", [hlsUrl, job.scout_id]);
    }
    if (job.pitch_id) {
      await pg.query("UPDATE founder_answers SET compressed_pitch_answer_url = $1 WHERE pitch_id = $2", [hlsUrl, job.pitch_id]);
    }

    sendLog(job.job_id, "Processing complete. HLS URL: " + hlsUrl, true);
  } catch (err) {
    log('Job error:', err);
    await pg.query("UPDATE video_jobs SET status = 'failed' WHERE job_id = $1", [job.job_id]);
    sendLog(job.job_id, "Processing failed: " + err.message, true);
  } finally {
    // Cleanup temp files
    try { if (inputPath) fs.unlinkSync(inputPath); } catch (e) { log('Cleanup input error:', e.message); }
    try { if (outputDir) fs.rmSync(outputDir, { recursive: true, force: true }); } catch (e) { log('Cleanup output error:', e.message); }
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