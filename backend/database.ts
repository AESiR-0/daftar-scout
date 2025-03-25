import "dotenv"
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@/backend/drizzle/schema";
import { Pool } from 'pg';

export const client = new Pool({
    host: process.env.host,
    port: parseInt(process.env.port as string),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

export const db = drizzle(client, { schema }); // Use all schemas combined with `*`