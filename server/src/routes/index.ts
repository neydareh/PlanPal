import { Express } from "express";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { healthRoutes } from "./health.routes";
import { eventRoutes } from "./event.routes";
import { userRoutes } from "./user.routes";
import { songRoutes } from "./song.routes";
import { blockoutRoutes } from "./blockout.routes";

export function registerRoutes(app: Express) {
  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Public routes
  app.use("/api/health", healthRoutes);

  // API routes
  app.use("/api/events", eventRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/songs", songRoutes);
  app.use("/api/blockouts", blockoutRoutes);
}
