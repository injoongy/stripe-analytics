// Only load dotenv in development (not in production where env vars are provided by the platform)
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv/config');
    } catch (e) {
        // dotenv not available, use environment variables directly
    }
}

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: '../worker/server/db/drizzle',
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
