import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import { OrgService } from "../services/org.service";
import { UserService } from "../services/user.service";
import { validateRequest } from "../middleware/validation.middleware";
import {
  AddOrgMemberSchema,
  CreateOrgSchema,
} from "../interfaces/dto";

type OrgRouteGuards = {
  requireOrgAdmin: (orgIdParam?: string) => any;
  requireOrgMember: (orgIdParam?: string) => any;
};

export function createOrgRoutes(
  orgService = new OrgService(),
  _guards?: OrgRouteGuards,
  userService = new UserService(),
) {
  const router = Router();
  const orgController = new OrgController(orgService, userService);

  router.get("/", (req, res) => orgController.getOrgs(req, res));

  router.post("/", validateRequest(CreateOrgSchema), (req, res) =>
    orgController.createOrg(req, res)
  );

  router.get("/:orgId", (req, res) =>
    orgController.getOrg(req, res)
  );

  router.get("/:orgId/members", (req, res) =>
    orgController.getOrgMembers(req, res)
  );

  router.post(
    "/:orgId/members",
    validateRequest(AddOrgMemberSchema),
    (req, res) => orgController.addOrgMember(req, res)
  );

  return router;
}

export const orgRoutes = createOrgRoutes();
