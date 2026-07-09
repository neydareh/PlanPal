import { Request, Response } from "express";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export async function healthCheck(req: Request, res: Response) {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: "OK",
    services: {
      database: "unknown",
    },
  };

  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    health.services.database = "OK";
  } catch (error) {
    health.services.database = "ERROR";
    health.status = "ERROR";
  }

  const httpCode = health.status === "OK" ? 200 : 503;
  res.status(httpCode).json(health);
}

export async function readinessCheck(req: Request, res: Response) {
  res.status(200).json({ status: "OK" });
}
