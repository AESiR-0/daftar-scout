// createDummyUser.js
import { createClient } from "@supabase/supabase-js";
import "dotenv/config"; // Only if you're using .env file

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service Role Key from your Supabase settings

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createDummyUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "pratham@daftaros.com",
    password: process.env.DUMMY_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error("❌ Error creating dummy user:", error.message);
  } else {
    console.log("✅ Dummy user created successfully:", data.user.id);
  }
}

createDummyUser();
