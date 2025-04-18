import { db } from "@/backend/database";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  // Extract the underlying pool to close it later
  const pool = (db as any).query?.connection; // Fallback if needed
  try {
    await migrate(db, {
      migrationsFolder: "./backend/drizzle/migrations", // Use relative path
    });
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    if (pool instanceof Pool) {
      await pool.end();
    }
  }
}

main();
