import { Request, Response } from "express";
import { CreateTeamInviteDTO } from "../interfaces/dto";
import { OrgService } from "../services/org.service";
import { TeamInviteService } from "../services/team-invite.service";
import { TeamService } from "../services/team.service";
import { UserService } from "../services/user.service";
import { getOrgIdFromRequest } from "../utils/org-id";

export class TeamInviteController {
  constructor(
    private teamInviteService: TeamInviteService,
    private teamService: TeamService,
    private orgService: OrgService,
    private userService: UserService = new UserService(),
  ) {}

  private serializeInvite(invite: any) {
    const { tokenHash, ...rest } = invite;
    return rest;
  }

  private async resolveCurrentUser(req: Request) {
    const authProviderId = (req as any).user?.id ?? (req as any).user?.sub;
    if (!authProviderId) {
      return null;
    }
    return this.userService.getOrCreateByAuthProviderId(authProviderId);
  }

  async createInvite(req: Request, res: Response) {
    const inviteData = req.body as CreateTeamInviteDTO;

    const user = await this.resolveCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orgId = getOrgIdFromRequest(req);
    if (!orgId && orgId != "") {
      return res
        .status(400)
        .json({ message: "Organization ID was not found" });
    }

    const team = await this.orgService.ensureTeamInOrg(
      orgId,
      req.params.teamId,
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isAdmin = await this.teamService.isTeamAdmin(team.id, user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { invite, token } = await this.teamInviteService.createInvite(
        team.id,
        user.id,
        inviteData,
      );
      return res.status(201).json({ invite: this.serializeInvite(invite), token });
    } catch (error) {
      return res.status(500).json({ message: "Failed to create invite" });
    }
  }

  async listInvites(req: Request, res: Response) {
    const user = await this.resolveCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orgId = getOrgIdFromRequest(req);
    if (!orgId && orgId != "") {
      return res
        .status(400)
        .json({ message: "Organization ID was not found" });
    }

    const team = await this.orgService.ensureTeamInOrg(
      orgId,
      req.params.teamId,
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isAdmin = await this.teamService.isTeamAdmin(team.id, user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const invites = await this.teamInviteService.listTeamInvites(team.id);
      return res.json(invites.map((invite) => this.serializeInvite(invite)));
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch invites" });
    }
  }

  async regenerateInvite(req: Request, res: Response) {
    const user = await this.resolveCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const orgId = getOrgIdFromRequest(req);
    if (!orgId && orgId != "") {
      return res
        .status(400)
        .json({ message: "Organization ID was not found" });
    }

    const team = await this.orgService.ensureTeamInOrg(
      orgId,
      req.params.teamId,
    );
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isAdmin = await this.teamService.isTeamAdmin(team.id, user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { invite, token } = await this.teamInviteService.regenerateInvite(
        req.params.inviteId,
        user.id,
      );
      return res.json({ invite: this.serializeInvite(invite), token });
    } catch (error) {
      if (error instanceof Error && error.message === "invite_not_found") {
        return res.status(404).json({ message: "Invite not found" });
      }
      return res.status(500).json({ message: "Failed to regenerate invite" });
    }
  }

  async getInvite(req: Request, res: Response) {
    const user = await this.resolveCurrentUser(req);
    if (!user || !user.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const invite = await this.teamInviteService.getInviteByToken(
        req.params.token,
      );
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (invite.email !== user.email.toLowerCase().trim()) {
        return res.status(403).json({ message: "Invite email mismatch" });
      }

      const team = await this.teamService.getTeamById(invite.teamId);
      return res.json({
        invite: this.serializeInvite(invite),
        team: team ? { id: team.id, name: team.name } : null,
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch invite" });
    }
  }

  async acceptInvite(req: Request, res: Response) {
    const user = await this.resolveCurrentUser(req);
    if (!user || !user.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const membership = await this.teamInviteService.acceptInvite(
        req.params.token,
        user.id,
        user.email,
      );
      return res.status(201).json(membership);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "invite_not_found") {
          return res.status(404).json({ message: "Invite not found" });
        }
        if (error.message === "invite_not_pending") {
          return res.status(409).json({ message: "Invite is not pending" });
        }
        if (error.message === "invite_email_mismatch") {
          return res.status(403).json({ message: "Invite email mismatch" });
        }
        if (error.message === "duplicate_membership") {
          return res.status(409).json({ message: "Already a team member" });
        }
      }
      return res.status(500).json({ message: "Failed to accept invite" });
    }
  }

  async declineInvite(req: Request, res: Response) {
    const user = await this.resolveCurrentUser(req);
    if (!user || !user.email) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const invite = await this.teamInviteService.declineInvite(
        req.params.token,
        user.email,
      );
      return res.json(this.serializeInvite(invite));
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "invite_not_found") {
          return res.status(404).json({ message: "Invite not found" });
        }
        if (error.message === "invite_not_pending") {
          return res.status(409).json({ message: "Invite is not pending" });
        }
        if (error.message === "invite_email_mismatch") {
          return res.status(403).json({ message: "Invite email mismatch" });
        }
      }
      return res.status(500).json({ message: "Failed to decline invite" });
    }
  }
}
