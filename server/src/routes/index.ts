import { Express } from "express";
import { eventRoutes } from "./event.routes";
import { userRoutes } from "./user.routes";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { apiKeyAuth } from "../middleware/api-key.middleware";

export function registerRoutes(app: Express) {
  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // API routes with authentication
  app.use("/api/events", eventRoutes);
  app.use("/api/users", userRoutes);

  // Service-to-service API routes (requires API key)
  app.use("/api/v1/events", apiKeyAuth(), eventRoutes);
  app.use("/api/v1/users", apiKeyAuth(), userRoutes);
}
