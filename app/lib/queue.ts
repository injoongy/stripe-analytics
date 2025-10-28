import { Queue, type JobsOptions } from "bullmq";

const STRIPE_QUEUE_NAME = "stripe-scrape";

const connection = {
  url: process.env.REDIS_URL,
};

export const stripeQueue = new Queue(STRIPE_QUEUE_NAME, { connection });

export const defaultJobOpts: JobsOptions = {
  attempts: 1,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600 },
};

