// lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pgSSl = process.env.PG_SSL
const pool = new Pool({
  host: process.env.PG_HOST!,
  port: 5432,
  user: process.env.PG_USER!,
  password: process.env.PG_PASSWORD!,
  database: process.env.PG_DATABASE!,
  ssl: {
    rejectUnauthorized: true,
    ca:pgSSl
  },
});

export const db = drizzle(pool);
