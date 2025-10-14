import Redis from "ioredis";

let client: Redis | null = null;

export function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not set");
  }

  if (!client || client.status === "end") {
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
    });
  }

  return client;
}
