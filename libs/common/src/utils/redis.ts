import Redis from "ioredis";

class RedisClient {
  private static instance: Redis | null = null;
  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = RedisClient.createRedisInstance();
    }

    return RedisClient.instance;
  }

  public static createRedisInstance(attempt: number = 1): Redis {
    const redis = new Redis(process.env.REDIS_URL!);    

    redis.on("connect", () => console.log(`Connected to Redis`));
    redis.on("error", async (err) => {
      console.error(`Redis error on DB`, err);

      if (attempt <= 3) {
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 10000);
        console.log(
          `Retrying Redis connection (Attempt ${attempt}/3) in ${delay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        RedisClient.instance = RedisClient.createRedisInstance(attempt + 1);
      } else
        console.error(`Redis connection failed after 3 attempts for Redis`);
    });

    return redis;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      const redis = RedisClient.instance;
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
