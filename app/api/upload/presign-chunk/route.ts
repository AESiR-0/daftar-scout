import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;

const s3 = new S3Client({ region: REGION });

export async function POST(req: NextRequest) {
  const { type, scoutId, pitchId, uploadId, chunkIndex, filename, mimeType } = await req.json();
  console.log({ type, scoutId, pitchId, uploadId, chunkIndex, filename, mimeType });
  if (
    !type ||
    !scoutId ||
    uploadId === undefined ||
    chunkIndex === undefined ||
    !filename ||
    !mimeType ||
    (type === 'founder' && !pitchId)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  let chunkKey;
  if (type === 'founder') {
    chunkKey = `founder-pitch/chunks/${uploadId}/chunk_${chunkIndex}`;
  } else if (type === 'investor') {
    chunkKey = `investor-pitch/chunks/${uploadId}/chunk_${chunkIndex}`;
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: chunkKey,
    ContentType: mimeType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
  return NextResponse.json({ url, chunkKey });
} 