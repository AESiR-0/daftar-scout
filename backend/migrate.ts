import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
});

const db = drizzle(pool);

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
