import { Request, Response } from "express";
import {
  AddTeamMemberSchema,
  CreateTeamSchema,
  UpdateTeamMemberSchema,
} from "../interfaces/dto";
import { OrgService } from "../services/org.service";
import { TeamService } from "../services/team.service";
import { UserService } from "../services/user.service";
import { getOrgIdFromRequest } from "@server/utils/org-id";

export class TeamController {
  constructor(
    private teamService: TeamService,
    private orgService: OrgService,
    private userService: UserService = new UserService(),
  ) {}

  async createTeam(req: Request, res: Response) {
    const validationResult = CreateTeamSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const authProviderId = (req as any).user?.id ?? (req as any).user?.sub;
      const fallbackUser = authProviderId
        ? null
        : await this.userService.getUserByEmail("system@churchflow.com");

      const createdBy = authProviderId
        ? (await this.userService.getOrCreateByAuthProviderId(authProviderId))
            .id
        : fallbackUser?.id;
      if (!createdBy) {
        return res
          .status(400)
          .json({ message: "No user available to create team" });
      }

      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      const team = await this.teamService.createTeam(
        resolvedOrgId,
        createdBy,
        validationResult.data
      );
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to create team" });
    }
  }

  async getTeams(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const teams = await this.teamService.getTeamsForOrg(orgId);

      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  }

  async getTeam(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      
      if (!orgId) {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const team = await this.teamService.getTeamById(req.params.teamId);

      if (!team || team.orgId !== orgId) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  }

  async getTeamMembers(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);

      if (!orgId) {
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

      const members = await this.teamService.listTeamMembers(req.params.teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  }

  async addTeamMember(req: Request, res: Response) {
    const validationResult = AddTeamMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const team = await this.orgService.ensureTeamInOrg(
        req.params.orgId,
        req.params.teamId
      );
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const member = await this.teamService.addTeamMember(
        req.params.teamId,
        validationResult.data
      );
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate")) {
        return res.status(409).json({ message: "Member already exists" });
      }
      res.status(500).json({ message: "Failed to add team member" });
    }
  }

  async updateTeamMember(req: Request, res: Response) {
    const validationResult = UpdateTeamMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const team = await this.orgService.ensureTeamInOrg(
        req.params.orgId,
        req.params.teamId
      );
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const membership = await this.teamService.getTeamMemberById(
        req.params.memberId
      );
      if (!membership || membership.teamId !== req.params.teamId) {
        return res.status(404).json({ message: "Team member not found" });
      }

      const member = await this.teamService.updateTeamMember(
        req.params.memberId,
        validationResult.data
      );
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to update team member" });
    }
  }

}
