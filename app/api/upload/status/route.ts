import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;
const REGION = process.env.AWS_REGION!;
const s3 = new S3Client({ region: REGION });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const uploadId = searchParams.get('uploadId');
  let statusKey;
  if (type === 'founder') {
    statusKey = `founder-pitch/status/${uploadId}.json`;
  } else if (type === 'investor') {
    statusKey = `investor-pitch/status/${uploadId}.json`;
  } else {
    return NextResponse.json({ status: 'error', error: 'Invalid type' }, { status: 400 });
  }
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: statusKey });
    const data = await s3.send(command);
    const body = await streamToString(data.Body);
    return NextResponse.json(JSON.parse(body));
  } catch (err) {
    return NextResponse.json({ status: 'not_found' }, { status: 404 });
  }
}

function streamToString(stream: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
} 