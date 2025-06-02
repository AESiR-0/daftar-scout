// lib/uploadPitchVideo.ts
'use server'
import { uploadVideoToS3, deleteVideoFromS3 } from '../s3';

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase

export async function uploadInvestorPitchDocument(file: File, scoutId: string) {
  try {
    const filePath = `investor-docs/${scoutId}-${Date.now()}-${file.name}`;
    const signedUrl = await uploadVideoToS3(file, filePath);
    return signedUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function uploadFounderPitchDocument(
  file: File,
  pitchId: string,
  scoutId: string
) {
  try {
    const filePath = `founder-docs/${scoutId}-${pitchId}-${Date.now()}-${file.name}`;
    const signedUrl = await uploadVideoToS3(file, filePath);
    return signedUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

export async function deleteFounderPitchDocument(docUrl: string) {
  try {
    // Extract file path from URL
    const urlParts = docUrl.split('.amazonaws.com/');
    if (urlParts.length !== 2) {
      throw new Error("Invalid document URL format");
    }

    const filePath = urlParts[1];
    await deleteVideoFromS3("founder", filePath);
    return true;
  } catch (error) {
    console.error("Error in deleteFounderPitchDocument:", error);
    throw error;
  }
}
