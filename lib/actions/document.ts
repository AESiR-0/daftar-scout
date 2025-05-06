// lib/uploadPitchVideo.ts
import { supabase } from "@/lib/supabase/createClient";

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase

export async function uploadInvestorPitchDocument(file: File, scoutId: string) {
  // 1. Sign in the dummy user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: DUMMY_EMAIL,
    password: DUMMY_PASSWORD,
  });

  if (signInError) {
    throw new Error("Failed to sign in: " + signInError.message);
  }

  // 2. Check session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (!sessionData.session || sessionError) {
    throw new Error("No session available.");
  }

  // 3. Upload
  const filePath = `investor-docs/${scoutId}-${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("documents") // 👈 new bucket
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // 4. Optional: get public URL (if allowed)
  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

export async function uploadFounderPitchDocument(
  file: File,
  pitchId: string,
  scoutId: string
) {
  // 1. Sign in the dummy user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: DUMMY_EMAIL,
    password: DUMMY_PASSWORD,
  });

  if (signInError) {
    throw new Error("Failed to sign in: " + signInError.message);
  }

  // 2. Check session
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (!sessionData.session || sessionError) {
    throw new Error("No session available.");
  }

  // 3. Upload to Supabase Storage
  const filePath = `founder-docs/${scoutId}-${pitchId}-${Date.now()}-${
    file.name
  }`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // 4. Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  if (!publicUrlData.publicUrl) {
    throw new Error("Failed to get public URL");
  }

  return publicUrlData.publicUrl;
}

export async function deleteFounderPitchDocument(docUrl: string) {
  try {
    // 1. Sign in the dummy user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: DUMMY_EMAIL,
      password: DUMMY_PASSWORD,
    });

    if (signInError) {
      throw new Error("Failed to sign in: " + signInError.message);
    }

    // 2. Check session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (!sessionData.session || sessionError) {
      throw new Error("No session available.");
    }

    // 3. Extract file path from URL and delete from storage
    const filePathMatch = docUrl.match(/documents\/(.*)/);
    if (!filePathMatch) {
      throw new Error("Invalid document URL format");
    }

    const filePath = filePathMatch[1];
    const { error: deleteError } = await supabase.storage
      .from("documents")
      .remove([filePath]);

    if (deleteError) {
      throw new Error("Failed to delete from storage: " + deleteError.message);
    }

    return true;
  } catch (error) {
    console.error("Error in deleteFounderPitchDocument:", error);
    throw error;
  }
}
