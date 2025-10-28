import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: '../worker/server/db/drizzle',
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
