import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  "https://yvaoyubwynyvqfelhzcd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YW95dWJ3eW55dnFmZWxoemNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDEyMzIsImV4cCI6MjA1OTYxNzIzMn0.V4-TQm-R5HUyLUBIu4uBKzYXAUpHvE7YALkGhGeQx_M"
);
