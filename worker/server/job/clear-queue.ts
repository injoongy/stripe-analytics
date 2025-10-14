// Script to clear failed jobs from the queue
import { config } from "dotenv";
config();

import { Queue } from "bullmq";
import { getConnection } from "./env";

const STRIPE_QUEUE_NAME = "stripe-scrape";
const connection = getConnection();

async function clearQueue() {
  const queue = new Queue(STRIPE_QUEUE_NAME, { connection });

  try {
    // Remove all failed jobs
    const failed = await queue.clean(0, 1000, 'failed');
    console.log(`Removed ${failed.length} failed jobs`);

    // Remove all completed jobs
    const completed = await queue.clean(0, 1000, 'completed');
    console.log(`Removed ${completed.length} completed jobs`);

    // Remove all waiting jobs
    await queue.drain();
    console.log('Drained all waiting jobs');

    const counts = await queue.getJobCounts();
    console.log('Current queue status:', counts);

  } catch (error) {
    console.error('Error clearing queue:', error);
  } finally {
    await queue.close();
    process.exit(0);
  }
}

clearQueue();