import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.DB_SUPABASE_URL!,
  process.env.DB_NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
