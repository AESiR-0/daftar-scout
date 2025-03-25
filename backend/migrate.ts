import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { client } from "@/backend/database";


async function main() {
    await migrate(drizzle(client), {
      migrationsFolder: "@/backend/drizzle/migrations",
    });
  
    await client.end();
  }
  
  main();