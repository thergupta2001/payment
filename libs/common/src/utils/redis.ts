import Redis from "ioredis";

class RedisClient {
  private static instances: { [key: number]: Redis } = {};
  private constructor() {}

  public static getInstance(dbIndex: number = 0): Redis {
    if (!RedisClient.instances[dbIndex]) {
      RedisClient.instances[dbIndex] = new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: dbIndex,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });

      RedisClient.instances[dbIndex].on("connect", () =>
        console.log("Connected to Redis")
      );
      RedisClient.instances[dbIndex].on("err", (err) =>
        console.log("Redis error: ", err)
      );
    }

    return RedisClient.instances[dbIndex];
  }

  public static async disconnect(): Promise<void> {
    for(const dbIndex  in RedisClient.instances) {
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
