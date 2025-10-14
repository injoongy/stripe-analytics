// server/job/worker.ts (inside scrapeStripe)
import { config } from "dotenv";
// Load environment variables BEFORE importing modules that use them
config();

import { Job, Worker } from "bullmq";
import { drizzle } from "drizzle-orm/node-postgres";
import { nanoid } from "nanoid";
import { Pool } from "pg";
import { scrapedData } from "../db/schema";
import getStripeMetrics from "../job/metrics";
import { getConnection } from "./env";
import { STRIPE_QUEUE_NAME, stripeQueue } from "./queue";

type ScrapePayload = { stripeApiKey: string; userId?: string; };

const connection = getConnection();

// Setup PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool });

async function scrapeStripe({ stripeApiKey, userId, jobId }: { stripeApiKey: string; userId: string; jobId: string; }) {
  console.log("Starting scrapeStripe function");

  if (!stripeApiKey) {
    throw new Error("No stripeApiKey found in job data");
  }

  const metrics = await getStripeMetrics(stripeApiKey);

  const result = { metrics, finishedAt: new Date().toISOString() };

  // Store result in PostgreSQL
  const recordId = nanoid();
  console.log(`Storing result in PostgreSQL with id: ${recordId}`);

  const response = await db.insert(scrapedData).values({
    id: recordId,
    userId: userId,
    jobId: jobId,
    data: result,
  })

  console.log("Successfully stored results in PostgreSQL", response);
  
  return result;
}

const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 3);

console.log("🚀 Worker starting with configuration:");
console.log("- Queue:", STRIPE_QUEUE_NAME);
console.log("- Concurrency:", concurrency);
console.log("- Redis URL:", process.env.REDIS_URL ? "✅ Set" : "❌ Missing");
console.log("- Database URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing");
console.log("- Environment:", process.env.NODE_ENV || "development");
console.log("- Connection config:", connection);

const worker = new Worker(
  STRIPE_QUEUE_NAME,
  async (job: Job<ScrapePayload>) => {
    if (job.name !== "stripe-scrape") throw new Error(`Unknown job: ${job.name}`);

    return scrapeStripe({
      stripeApiKey: job.data.stripeApiKey,
      userId: job.data.userId || "system",
      jobId: job.id || nanoid()
    });
  },
  {
    connection,
    concurrency,
  }
);

// Worker ready
worker.on("ready", async () => {
  console.log("✅ Worker is ready and waiting for jobs!");

  // Check for waiting jobs
  const waitingJobs = await stripeQueue.getWaitingCount();
  console.log(`📋 Found ${waitingJobs} waiting jobs in queue`);
});

// Observability
worker.on("active", (job) =>
  console.log(JSON.stringify({ level: "info", evt: "active", id: job.id, name: job.name }))
);
worker.on("completed", (job, res) =>
  console.log(JSON.stringify({ level: "info", evt: "completed", id: job.id, result: res }))
);
worker.on("failed", (job, err) =>
  console.error(JSON.stringify({ level: "error", evt: "failed", id: job?.id, err: err?.message }))
);
worker.on("error", (err) =>
  console.error("Worker error:", err)
);

// Graceful shutdown
const stop = async () => {
  console.log("Closing worker...");
  await worker.close(); // lets current jobs finish
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
