// lib/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

declare global {
  var db: ReturnType<typeof drizzle> | undefined;
}

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = global.db || drizzle(client);

if (process.env.NODE_ENV !== "production") global.db = db;
