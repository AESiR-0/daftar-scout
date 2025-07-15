const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const cors = require('cors');
const { log } = require('console');
app.use(cors());

const CHUNKS_DIR = path.join(__dirname, 'chunks');

let S3;
let pg;

try {
    S3 = new AWS.S3({ region: process.env.AWS_REGION });
    pg = new Client({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(path.resolve(__dirname, '../../global-bundle.pem')).toString(),
        },
    });
    pg.connect()
        .then(() => console.log('connected'))
        .catch((e) => {
            console.error('Failed to connect to DB:', e);
            process.exit(1);
        });
} catch (e) {
    console.error('Worker Error : ', e);
    process.exit(1);
}

app.get('/health', (req, res) => res.send('OK'));

app.post('/upload-chunk', upload.single('chunk'), async (req, res) => {
    const { uploadId, chunkIndex, totalChunks, filename, scoutId, pitchId, pitchType, questionId } = req.body;
    const chunk = req.file;

    console.log(`[chunks_merger] Received chunk ${chunkIndex} for uploadId ${uploadId}`);

    if (!uploadId || chunkIndex === undefined || !chunk) {
        console.error('[chunks_merger] Missing data in request');
        return res.status(400).json({ error: 'Missing data' });
    }

    const uploadDir = path.join(CHUNKS_DIR, uploadId);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`[chunks_merger] Created upload directory: ${uploadDir}`);
    }

    const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`);
    fs.writeFileSync(chunkPath, chunk.buffer);
    console.log(`[chunks_merger] Wrote chunk ${chunkIndex} to ${chunkPath}`);

    // Check if all chunks are present
    const uploadedChunks = fs.readdirSync(uploadDir).filter(f => f.startsWith('chunk_'));
    if (uploadedChunks.length == totalChunks) {
        console.log(`[chunks_merger] All ${totalChunks} chunks received for uploadId ${uploadId}. Merging...`);
        // All chunks received, merge them
        const mergedPath = path.join(uploadDir, filename);
        const writeStream = fs.createWriteStream(mergedPath);

        writeStream.on('finish', async () => {
            try {
                console.log(`[chunks_merger] Merged file created at ${mergedPath}`);
                // Upload merged file to S3
                log(parseInt(questionId), pitchId, "data recd");
                const mergedFileBuffer = fs.readFileSync(mergedPath);
                let s3Key;
                if (pitchType === 'founder') {
                    s3Key = `founder-pitch/merged/${uploadId}/${filename}`;
                    // Update founder_answers table only if no video exists
                    const videoUrl = `https://d2nq6gsuamvat4.cloudfront.net/${s3Key}`;
                    if (questionId) {

                        await pg.query(
                            `UPDATE founder_answers SET pitch_answer_url = $1 WHERE pitch_id = $2 AND question_id = $3`,
                            [videoUrl, pitchId, parseInt(questionId)]
                        );
                        log('updated : ', videoUrl, pitchId, questionId);
                    } else {
                        // If questionId is not provided, do not update any rows (safety)
                        console.warn('[chunks_merger] No questionId provided for founder upload, skipping update.');
                    }
                } else {
                    s3Key = `investor-pitch/merged/${uploadId}/${filename}`;
                    // Update scouts table
                    await pg.query(
                        `UPDATE scouts SET investor_pitch = $1 WHERE scout_id = $2`,
                        [`https://d2nq6gsuamvat4.cloudfront.net/${s3Key}`, scoutId]
                    );
                }
                await S3.putObject({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: s3Key,
                    Body: mergedFileBuffer,
                    ContentType: 'video/mp4',
                }).promise();
                console.log(`[chunks_merger] Uploaded merged file to S3 at ${s3Key}`);

                // Insert job for compression worker and update correct pitch column
                const jobId = crypto.randomUUID();
                try {
                    await pg.query(
                        "INSERT INTO video_jobs (job_id, s3_key, status, scout_id, pitch_id) VALUES ($1, $2, 'pending', $3, $4)",
                        [jobId, s3Key, scoutId, pitchId]
                    );
                    console.log(`[chunks_merger] Inserted compression job ${jobId} for S3 key ${s3Key}`);
                } catch (dbErr) {
                    console.error('[chunks_merger] DB error during job insert:', dbErr);
                    return res.status(500).json({ error: dbErr.message });
                }

                // Clean up chunk files and merged file
                fs.rmSync(uploadDir, { recursive: true, force: true });
                console.log(`[chunks_merger] Cleaned up upload directory: ${uploadDir}`);

                // Clean up the entire chunks directory
                try {
                    fs.rmSync(CHUNKS_DIR, { recursive: true, force: true });
                    console.log(`[chunks_merger] Cleaned up CHUNKS_DIR: ${CHUNKS_DIR}`);
                } catch (e) {
                    console.warn(`[chunks_merger] Failed to clean up CHUNKS_DIR: ${e.message}`);
                }

                res.json({ status: 'merged', mergedPath, s3Key, jobId });
            } catch (err) {
                console.error('[chunks_merger] Error during merge/upload/job:', err);
                res.status(500).json({ error: err.message });
            }
        });
        for (let i = 0; i < totalChunks; i++) {
            const chunkData = fs.readFileSync(path.join(uploadDir, `chunk_${i}`));
            writeStream.write(chunkData);
        }
        writeStream.end();
    } else {
        res.json({ status: 'chunk uploaded', chunkIndex });
    }
});

app.listen(9898, () => {
    console.log('chunks_merger worker listening on port 9898');
});