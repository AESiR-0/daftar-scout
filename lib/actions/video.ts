'use server'
import { uploadVideoToS3, getCloudFrontUrl } from '../s3';

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase
const baseUrl = process.env.AUTH_URL
// Utility for chunked upload
export async function uploadFileInChunks({
  file,
  type,
  scoutId,
  pitchId,
  onProgress,
}: {
  file: File;
  type: 'founder' | 'investor';
  scoutId: string;
  pitchId?: string;
  onProgress?: (percent: number) => void;
}): Promise<string> {
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);
    // Get presigned URL
    const presignRes = await fetch(`${baseUrl}/api/upload/presign-chunk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        scoutId,
        pitchId,
        uploadId,
        chunkIndex: i,
        filename: file.name,
        mimeType: file.type,
      }),
    });
    const { url } = await presignRes.json();
    await fetch(url, { method: 'PUT', body: chunk });
    if (onProgress) onProgress(Math.round(((i + 1) / totalChunks) * 100));
  }
  // Trigger merge
  const completeRes = await fetch(`${baseUrl}/api/upload/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      scoutId,
      pitchId,
      uploadId,
      filename: file.name,
      totalChunks,
      mimeType: file.type,
    }),
  });
  const { uploadId: returnedUploadId } = await completeRes.json();
  // Poll for status
  let status = 'merging';
  let mergedKey = '';
  while (status === 'merging') {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${baseUrl}/api/upload/status?type=${type}&uploadId=${uploadId}`);
    const pollData = await pollRes.json();
    status = pollData.status;
    if (status === 'done') mergedKey = pollData.mergedKey;
    if (status === 'error') throw new Error(pollData.error);
  }
  return getCloudFrontUrl(mergedKey);
}

export async function uploadInvestorsPitchVideo(file: File, scoutId: string, onProgress?: (percent: number) => void) {
  return uploadFileInChunks({ file, type: 'investor', scoutId, onProgress });
}

export async function uploadAnswersPitchVideo(file: File, pitchId: string, scoutId: string, onProgress?: (percent: number) => void) {
  return uploadFileInChunks({ file, type: 'founder', scoutId, pitchId, onProgress });
}
