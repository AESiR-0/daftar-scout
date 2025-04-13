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
const user = await supabase.auth.getUser();
console.log(user); // should not be null

export async function uploadInvestorsPitchVideo(file: File, scoutId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const filePath = `private/${scoutId}-${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("pitch-videos")
    .upload(filePath, file);

  if (error) throw new Error(error.message);

  const { data: publicUrlData } = supabase.storage
    .from("pitch-videos")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
