// lib/uploadPitchVideo.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

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
