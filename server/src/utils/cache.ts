import Redis from "ioredis";
import { config } from "../config";
import LoggerService from "./logger";

export const redisClient = new Redis(config.redis.url, {
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// redisClient.on('error', (error) => {
//   LoggerService.error(error, { context: 'Redis Client' });
// });

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      LoggerService.error(error as Error, { context: "Cache Get", key });
      return null;
    }
  }

  static async set(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await redisClient.setex(key, ttlSeconds, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
    } catch (error) {
      LoggerService.error(error as Error, { context: "Cache Set", key });
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      LoggerService.error(error as Error, { context: "Cache Delete", key });
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      LoggerService.error(error as Error, {
        context: "Cache Pattern Delete",
        pattern,
      });
    }
  }
}
