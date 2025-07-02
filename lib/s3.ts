'use server'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";

if (!BUCKET_NAME) {
  throw new Error("AWS_S3_BUCKET_NAME environment variable is required");
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials environment variables are required");
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadVideoToS3(file: File, key: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return CloudFront URL for consistency
    return await getCloudFrontUrl(key);
  } catch (error: any) {
    console.error("Error uploading to S3:", {
      message: error.message,
      code: error.code,
      region: AWS_REGION,
      bucket: BUCKET_NAME
    });
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

export async function getCloudFrontUrl(key: string) {
  const domain = process.env.CLOUDFRONT_DOMAIN?.replace(/\/$/, '');
  return `${domain}/${key}`;
}

export async function getVideoUrl(key: string) {
  try {
    // Return CloudFront URL
    return await getCloudFrontUrl(key);
  } catch (error: any) {
    console.error("Error getting video URL:", {
      message: error.message,
      code: error.code,
      region: AWS_REGION,
      bucket: BUCKET_NAME
    });
    throw new Error(`Failed to get video URL: ${error.message}`);
  }
}

export async function deleteVideoFromS3(role: string, key: string) {
  try {

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    console.error("Error deleting from S3:", {
      message: error.message,
      code: error.code,
      region: AWS_REGION,
      bucket: BUCKET_NAME
    });
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
} 