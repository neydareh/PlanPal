import { Express } from "express";
import { apiLimiter } from "../middleware/rate-limit.middleware";
import { healthRoutes } from "./health.routes";
import { eventRoutes } from "./event.routes";
import { userRoutes } from "./user.routes";
import { songRoutes } from "./song.routes";
import { blockoutRoutes } from "./blockout.routes";
import { orgRoutes } from "./org.routes";
import { orgCodeMiddleware } from "../middleware/org-code.middleware";
import { kindeJwtVerifier } from "../middleware/kinde-auth.middleware";
import { teamRoutes } from "./team.routes";
import { inviteRoutes } from "./invite.routes";

export function registerRoutes(app: Express) {
  app.use("/api/health", healthRoutes);
  app.use("/api", apiLimiter, kindeJwtVerifier);

  app.use("/api/users", userRoutes);
  app.use("/api/invites", orgCodeMiddleware, inviteRoutes);
  app.use("/api/events", orgCodeMiddleware, eventRoutes);
  app.use("/api/songs", orgCodeMiddleware, songRoutes);
  app.use("/api/blockouts", orgCodeMiddleware, blockoutRoutes);
  app.use("/api/orgs", orgCodeMiddleware, orgRoutes);
  app.use("/api/orgs", orgCodeMiddleware, teamRoutes);
}
