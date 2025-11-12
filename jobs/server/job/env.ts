
export const getConnection = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required but not set");
  }

  // Log connection info (masked for security)
  try {
    const url = new URL(redisUrl);
    console.log(`🔗 Redis connection: ${url.protocol}//${url.hostname}:${url.port || 'default'}`);
  } catch (e) {
    console.log("⚠️  Redis URL format might be invalid");
  }

  return { url: redisUrl };
};

export const connection = getConnection();
