'use server'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

    // Generate a signed URL for the uploaded video
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // URL expires in 1 hour
    return signedUrl;
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

export async function getVideoUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return signedUrl;
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

export async function deleteVideoFromS3(key: string) {
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