import Redis from "ioredis";

class RedisClient {
  private static instances: { [key: number]: Redis } = {};
  private constructor() {}

  public static getInstance(dbIndex: number = 0): Redis {
    if (!RedisClient.instances[dbIndex]) {
      RedisClient.instances[dbIndex] = RedisClient.createRedisInstance(dbIndex);
    }

    return RedisClient.instances[dbIndex];
  }

  public static createRedisInstance(
    dbIndex: number,
    attempt: number = 1
  ): Redis {
    const redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: dbIndex,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on("connect", () =>
      console.log(`Connected to Redis (DB ${dbIndex})`)
    );
    redis.on("error", async (err) => {
      console.error(`Redis error on DB ${dbIndex}:`, err);

      if (attempt <= 3) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 10000);
        console.log(
          `Retrying Redis connection (Attempt ${attempt}/5) in ${delay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        RedisClient.instances[dbIndex] = RedisClient.createRedisInstance(
          dbIndex,
          attempt + 1
        );
      } else
        console.error(
          `Redis connection failed after 3 attempts for DB ${dbIndex}`
        );
    });

    return redis;
  }

  public static async disconnect(): Promise<void> {
    for (const dbIndex in RedisClient.instances) {
      const redis = RedisClient.instances[dbIndex];
      await redis.quit();
    }
    console.log("Disconnected from Redis");
  }
}

process.on("SIGINT", async () => {
  await RedisClient.disconnect();
  process.exit(0);
});

export default RedisClient;
