import { Express } from "express";
import { apiLimiter, authLimiter } from "../middleware/rate-limit.middleware";
import { apiKeyAuth } from "../middleware/api-key.middleware";
import authenticateUser from "../middleware/auth.middleware";
import { healthRoutes } from "./health.routes";
import { eventRoutes } from "./event.routes";
import { userRoutes } from "./user.routes";
import { songRoutes } from "./song.routes";
import { profileRoutes } from "./profile.routes";

export function registerRoutes(app: Express) {
  // Apply rate limiting to all API routes and Authenticated API routes
  app.use("/api", apiLimiter, authenticateUser);

  // Public routes
  app.use("/api/health", healthRoutes);

  // API routes with authentication
  app.use("/api/profile", authLimiter, profileRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/songs", songRoutes);

  // Service-to-service API routes (requires API key)
  app.use("/api/v1/events", apiKeyAuth(), eventRoutes);
  app.use("/api/v1/users", apiKeyAuth(), userRoutes);
  app.use("/api/v1/songs", apiKeyAuth(),songRoutes);

}
