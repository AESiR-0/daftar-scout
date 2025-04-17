// lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

declare global {
  // This prevents duplicate pools in Next.js dev mode
  var drizzleDb: ReturnType<typeof drizzle> | undefined;
  var drizzlePool: Pool | undefined;
}

const pool =
  global.drizzlePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL, // Use pooled connection from Supabase
    max: 10, // Optional: Supabase free tier max is 10
  });

export const db = global.drizzleDb ?? drizzle(pool);

if (process.env.NODE_ENV !== "production") {
  global.drizzlePool = pool;
  global.drizzleDb = db;
}
