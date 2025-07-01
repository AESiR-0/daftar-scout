import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

export default defineConfig({
  schema: "./backend/drizzle/models",
  out: "./backend/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST!,
    port: 5432,
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    ssl: {
      rejectUnauthorized: false, // ✅ ignore SSL cert errors (DEV only)
    },
  },
  verbose: true,
});
