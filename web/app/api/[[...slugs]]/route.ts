import crypto from "node:crypto";
import { scrapedData } from "@/auth-schema";
import { defaultJobOpts, stripeQueue } from "@/lib/queue";
import { cors, HTTPMethod } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Elysia } from "elysia";
import { Pool } from "pg";
import { betterAuth } from "../../../lib/auth-middleware";

const swaggerConfig = {
    documenation: {
        info: {
            title: "API Documentation",
            version: "0.0.0",
        },
    },
    path: "/docs",
};

// Setup PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool });
const app = new Elysia({ prefix: "/api" })
    .use(cors({
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"] as HTTPMethod[],
        allowedHeaders: "*",
        maxAge: 5,
    }))
    .use(swagger(swaggerConfig))
    .use(betterAuth)
    .post('/stripe', async ({ user, body }) => {
        const { stripeApiKey } = body as { stripeApiKey?: string };
        if (!stripeApiKey) {
            return {
                status: 400,
            };
        }

        const job = await stripeQueue.add("stripe-scrape", { stripeApiKey, userId: user.id }, {
            ...defaultJobOpts,
            jobId: `stripe-scrape:${user.id}:${crypto.randomUUID()}`, // idempotency
        });

        return { queued: true, id: job.id };
    }, { auth: true })
    .get('/stripe/status/:jobId', async ({ params, user }) => {
        const { jobId } = params;

        // Verify the job belongs to this user
        if (!jobId.includes(user.id)) {
            return { status: 403, error: "Unauthorized" };
        }

        const job = await stripeQueue.getJob(jobId);

        if (!job) {
            return { status: 404, error: "Job not found" };
        }

        const state = await job.getState();
        const progress = job.progress;
        const failedReason = job.failedReason;
        const returnvalue = job.returnvalue;

        return {
            id: jobId,
            state,
            progress,
            failedReason,
            result: state === 'completed' ? returnvalue : null,
            attemptsMade: job.attemptsMade,
            attemptsTotal: job.opts.attempts
        };
    }, { auth: true })
    .get('/stripe/data', async ({ user }) => {
        // Fetch all scraped data for the authenticated user
        const data = await db
            .select()
            .from(scrapedData)
            .where(eq(scrapedData.userId, user.id))
            .orderBy(desc(scrapedData.createdAt))
            .limit(10);

        return {
            data,
            count: data.length
        };
    }, { auth: true })
    .get('/stripe/data/:jobId', async ({ params, user }) => {
        const { jobId } = params;

        // Fetch specific scraped data by job ID for the authenticated user
        const data = await db
            .select()
            .from(scrapedData)
            .where(
                and(
                    eq(scrapedData.userId, user.id),
                    eq(scrapedData.jobId, jobId)
                )
            )
            .limit(1);

        if (!data.length) {
            return { status: 404, error: "Data not found" };
        }

        return data[0];
    }, { auth: true })

// Expose methods
export const GET = app.handle;
export const POST = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
export const PUT = app.handle;

export type API = typeof app;
