import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.DB_SUPABASE_URL!;
const supabaseKey = process.env.DB_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const DUMMY_EMAIL = process.env.DUMMY_EMAIL || "pratham@daftaros.com";
const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD || "Daftarcore123$"; // make sure this user exists in Supabase
