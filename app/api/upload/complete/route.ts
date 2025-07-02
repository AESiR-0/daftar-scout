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
  return NextResponse.json({ status: 'merging', uploadId }, { status: 202 });
} 