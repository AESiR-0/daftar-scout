'use server'
import { uploadVideoToS3 } from '../s3';

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase

export async function uploadInvestorsPitchVideo(
  file: File,
  scoutId: string,
  onProgress?: (progress: number) => void
) {
  try {
    onProgress?.(0.3); // 30% - Starting upload

    const filePath = `investor-pitch/${scoutId}-${Date.now()}-${file.name}`;
    const signedUrl = await uploadVideoToS3(file, filePath);

    onProgress?.(1); // 100% - Complete

    return signedUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadAnswersPitchVideo(
  file: File,
  pitchId: string,
  scoutId: string,
  onProgress?: (progress: number) => void
) {
  try {
    onProgress?.(0.3); // 30% - Starting upload

    const filePath = `founder-pitch/${pitchId}/${scoutId}-${Date.now()}-${file.name}`;
    const signedUrl = await uploadVideoToS3(file, filePath);

    onProgress?.(1); // 100% - Complete

    return signedUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
