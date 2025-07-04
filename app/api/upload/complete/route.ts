import { NextRequest, NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const REGION = process.env.AWS_REGION!;
const LAMBDA_ARN = process.env.MERGE_LAMBDA_ARN!;

export async function POST(req: NextRequest) {
  const { type, scoutId, pitchId, uploadId, filename, totalChunks, mimeType } = await req.json();

  const lambda = new LambdaClient({ region: REGION });
  const payload = {
    type,
    scoutId,
    pitchId,
    uploadId,
    filename,
    totalChunks,
    mimeType
  };

  const command = new InvokeCommand({
    FunctionName: LAMBDA_ARN,
    InvocationType: 'Event', // async
    Payload: Buffer.from(JSON.stringify(payload)),
  });

  await lambda.send(command);

  // Poll the status endpoint for the mergedKey
  let mergedKey = null;
  let status = 'merging';
  let pollCount = 0;
  while (status === 'merging' && pollCount < 30) { // up to 1 minute
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/upload/status?type=${type}&uploadId=${uploadId}`);
    const pollData = await pollRes.json();
    status = pollData.status;
    if (status === 'done') mergedKey = pollData.mergedKey;
    if (status === 'error') break;
    pollCount++;
  }

  // If merge succeeded, create a video_jobs entry for compression
  if (mergedKey) {
    // Dynamically import DB and model to avoid serverless cold start issues
    const { db } = await import('backend/database');
    const { videoJobs } = await import('@/backend/drizzle/models/video_jobs');
    const { randomUUID } = await import('crypto');
    const jobId = randomUUID();
    await db.insert(videoJobs).values({
      jobId,
      s3Key: mergedKey,
      status: 'pending',
      scoutId,
      pitchId,
    });
    return NextResponse.json({ status: 'merging', uploadId, jobId }, { status: 202 });
  }

  return NextResponse.json({ status, uploadId }, { status: status === 'error' ? 500 : 202 });
} 