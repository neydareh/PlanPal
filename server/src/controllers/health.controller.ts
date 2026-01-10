import { Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
// import Redis from "ioredis";
// import { config } from "../config";

// const redisClient = new Redis(config.redis.url);

export async function healthCheck(req: Request, res: Response) {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: "OK",
    services: {
      database: "unknown",
      // redis: 'unknown',
    },
  };

  try {
    // Check database
    await db.execute(sql`SELECT 1`);
    health.services.database = "OK";
  } catch (error) {
    health.services.database = "ERROR";
    health.status = "ERROR";
  }

  // try {
  //   // Check Redis
  //   await redisClient.ping();
  //   health.services.redis = 'OK';
  // } catch (error) {
  //   health.services.redis = 'ERROR';
  //   health.status = 'ERROR';
  // }

  const httpCode = health.status === "OK" ? 200 : 503;
  res.status(httpCode).json(health);
}

export async function readinessCheck(req: Request, res: Response) {
  // Add any additional readiness checks here
  res.status(200).json({ status: "OK" });
}
