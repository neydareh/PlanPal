import { Router } from "express";
import { TeamInviteController } from "../controllers/team-invite.controller";
import { TeamInviteService } from "../services/team-invite.service";
import { TeamService } from "../services/team.service";
import { OrgService } from "../services/org.service";

export function createInviteRoutes(
  teamInviteService = new TeamInviteService(),
  teamService = new TeamService(),
  orgService = new OrgService(),
) {
  const router = Router();
  const controller = new TeamInviteController(
    teamInviteService,
    teamService,
    orgService,
  );

  router.get("/:token", (req, res) => controller.getInvite(req, res));
  router.post("/:token/accept", (req, res) => controller.acceptInvite(req, res));
  router.post("/:token/decline", (req, res) =>
    controller.declineInvite(req, res),
  );

  return router;
}

export const inviteRoutes = createInviteRoutes();
