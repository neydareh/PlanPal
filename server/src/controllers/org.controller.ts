import { Request, Response } from "express";
import { OrgService } from "../services/org.service";
import { UserService } from "../services/user.service";
import {
  AddOrgMemberSchema,
  CreateOrgSchema,
  UpdateOrgMemberSchema,
  UpdateOrgSchema,
} from "../interfaces/dto";
import { getOrgIdFromRequest } from "@server/utils/org-id";

export class OrgController {
  constructor(
    private orgService: OrgService,
    private userService: UserService = new UserService(),
  ) {}

  async createOrg(req: Request, res: Response) {
    const validationResult = CreateOrgSchema.safeParse(req.body);
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
          .json({ message: "No user available to create org" });
      }

      const org = await this.orgService.createOrg(
        createdBy,
        validationResult.data,
      );
      res.status(201).json(org);
    } catch (error) {
      res.status(500).json({ message: "Failed to create organization" });
    }
  }

  async getOrgs(req: Request, res: Response) {
    try {
      const authProviderId = (req as any).user?.id ?? (req as any).user?.sub;
      const fallbackUser = authProviderId
        ? null
        : await this.userService.getUserByEmail("system@churchflow.com");
      const lookupUserId = authProviderId
        ? (await this.userService.getOrCreateByAuthProviderId(authProviderId))
            .id
        : fallbackUser?.id;

      if (!lookupUserId) {
        return res
          .status(400)
          .json({ message: "No user available to list orgs" });
      }

      const orgs = await this.orgService.getOrgsForUser(lookupUserId);
      res.json(orgs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  }

  async getOrg(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId && orgId != "") {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const org = await this.orgService.getOrgById(orgId);
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organization" });
    }
  }

  async updateOrg(req: Request, res: Response) {
    const validationResult = UpdateOrgSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      const org = await this.orgService.updateOrg(
        resolvedOrgId,
        validationResult.data,
      );
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: "Failed to update organization" });
    }
  }

  async deleteOrg(req: Request, res: Response) {
    try {
      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      await this.orgService.deleteOrg(resolvedOrgId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete organization" });
    }
  }

  async getOrgMembers(req: Request, res: Response) {
    try {
      const orgId = getOrgIdFromRequest(req);
      if (!orgId && orgId != "") {
        return res
          .status(400)
          .json({ message: "Organization ID was not found" });
      }

      const members = await this.orgService.listOrgMembers(orgId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch org teams" });
    }
  }

  async addOrgMember(req: Request, res: Response) {
    const validationResult = AddOrgMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      const member = await this.orgService.addOrgMember(
        resolvedOrgId,
        validationResult.data,
      );
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate")) {
        return res.status(409).json({ message: "Member already exists" });
      }
      res.status(500).json({ message: "Failed to add org team" });
    }
  }

  async updateOrgMember(req: Request, res: Response) {
    const validationResult = UpdateOrgMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: validationResult.error.errors,
      });
    }

    try {
      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      const membership = await this.orgService.getOrgMemberById(
        req.params.memberId,
      );
      if (!membership || membership.orgId !== resolvedOrgId) {
        return res.status(404).json({ message: "Org team not found" });
      }

      const member = await this.orgService.updateOrgMemberRole(
        req.params.memberId,
        validationResult.data,
      );
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to update org team" });
    }
  }

  async removeOrgMember(req: Request, res: Response) {
    try {
      const resolvedOrgId = (req as any).orgId ?? req.params.orgId;
      const membership = await this.orgService.getOrgMemberById(
        req.params.memberId,
      );
      if (!membership || membership.orgId !== resolvedOrgId) {
        return res.status(404).json({ message: "Org team not found" });
      }

      await this.orgService.removeOrgMember(req.params.memberId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove org team" });
    }
  }
}
