import { Queue, type JobsOptions } from "bullmq";

const STRIPE_QUEUE_NAME = "stripe-scrape";

const connection = {
  url: process.env.REDIS_URL,
};

// Lazy initialization to avoid connecting during build
let queueInstance: Queue | null = null;
export const getStripeQueue = () => {
  if (!queueInstance && process.env.REDIS_URL) {
    queueInstance = new Queue(STRIPE_QUEUE_NAME, { connection });
  }
  return queueInstance!;
};

// Keep backward compatibility
export const stripeQueue = new Proxy({} as Queue, {
  get(_, prop) {
    return getStripeQueue()[prop as keyof Queue];
  }
});

export const defaultJobOpts: JobsOptions = {
  attempts: 1,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: { age: 3600, count: 1000 },
  removeOnFail: { age: 24 * 3600 },
};

