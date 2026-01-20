import { Express } from "express";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { healthRoutes } from "./health.routes";
import { eventRoutes } from "./event.routes";
import { userRoutes } from "./user.routes";
import { songRoutes } from "./song.routes";
import { blockoutRoutes } from "./blockout.routes";
import { orgRoutes } from "./org.routes";
import { teamRoutes } from "./team.routes";
import { orgSchemaMiddleware } from "../middleware/org-schema.middleware";
import { kindeJwtVerifier } from "../middleware/kinde-auth.middleware";

export function registerRoutes(app: Express) {
  // Apply rate limiting to all API routes
  app.use("/api", apiLimiter);

  // Public routes
  app.use("/api/health", healthRoutes);

  // API routes
  app.use("/api/users", userRoutes);
  app.use("/api/orgs", kindeJwtVerifier);
  app.use("/api/orgs/:orgId", orgSchemaMiddleware);
  app.use("/api/orgs/:orgId/events", eventRoutes);
  app.use("/api/orgs/:orgId/songs", songRoutes);
  app.use("/api/orgs/:orgId/blockouts", blockoutRoutes);
  app.use("/api/orgs", orgRoutes);
  app.use("/api/orgs", teamRoutes);
}
