import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "fs";
const port = process.env.PG_PORT || '5432'
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(port),
  user: process.env.PG_USER,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('./global-bundle.pem').toString(), // Use the cert bundle here
  },
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

const db = drizzle(pool);
const pgSSl = process.env.PG_SSL

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: "./backend/drizzle/migrations",
    });
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end(); // Always close the pool
  }
}

main();
