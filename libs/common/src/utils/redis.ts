import Redis from "ioredis";

class RedisClient {
  private static instance: Redis;
  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });

      RedisClient.instance.on("connect", () =>
        console.log("Connected to Redis")
      );
      RedisClient.instance.on("err", (err) =>
        console.log("Redis error: ", err)
      );
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      console.log("Redis connection closed");
    }
  }
}

process.on("SIGINT", async () => {
  await RedisClient.disconnect();
  process.exit(0);
});

export default RedisClient.getInstance();
