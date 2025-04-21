import * as dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config(); // This loads environment variables



export default defineConfig({
    schema: './backend/drizzle/models',
    out: './backend/drizzle/migrations',
    dialect: "postgresql",
    dbCredentials: {
        url: `${process.env.DATABASE_URL}`
    },
    verbose: true,
    strict: true
})