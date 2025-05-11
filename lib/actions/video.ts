// lib/uploadPitchVideo.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_DB_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_DB_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase

export async function uploadInvestorsPitchVideo(
  file: File, 
  scoutId: string,
  onProgress?: (progress: number) => void
) {
  try {
    // 1. Sign in the dummy user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DUMMY_EMAIL,
      password: DUMMY_PASSWORD,
    });

    onProgress?.(0.3); // 30% - Authentication complete

    if (signInError) {
      throw new Error("Failed to sign in: " + signInError.message);
    }

    // 2. Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionData.session || sessionError) {
      throw new Error("No session available.");
    }

    onProgress?.(0.5); // 50% - Session verified

    // 3. Upload
    const filePath = `investor-pitch/${scoutId}-${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    onProgress?.(0.8); // 80% - Upload complete

    if (error) {
      throw new Error(error.message);
    }

    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    onProgress?.(1); // 100% - Complete

    return publicUrlData.publicUrl;
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
    // 1. Sign in the dummy user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DUMMY_EMAIL,
      password: DUMMY_PASSWORD,
    });

    onProgress?.(0.3); // 30% - Authentication complete

    if (signInError) {
      throw new Error("Failed to sign in: " + signInError.message);
    }

    // 2. Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionData.session || sessionError) {
      throw new Error("No session available.");
    }

    onProgress?.(0.5); // 50% - Session verified

    // 3. Upload
    const filePath = `founder-pitch/${pitchId}/${scoutId}-${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    onProgress?.(0.8); // 80% - Upload complete

    if (error) {
      throw new Error(error.message);
    }

    // 4. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    onProgress?.(1); // 100% - Complete

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
