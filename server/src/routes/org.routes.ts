import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import { OrgService } from "../services/org.service";
import { UserService } from "../services/user.service";
import { validateRequest } from "../middleware/validation.middleware";
import {
  AddOrgMemberSchema,
  CreateOrgSchema,
  UpdateOrgMemberSchema,
  UpdateOrgSchema,
} from "../interfaces/dto";
// import { requireOrgAdmin, requireOrgMember } from "../middleware/org-role.middleware";

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

  // router.put(
  //   "/:orgId",
  //   guards.requireOrgAdmin(),
  //   validateRequest(UpdateOrgSchema),
  //   (req, res) => orgController.updateOrg(req, res)
  // );

  // router.delete("/:orgId", guards.requireOrgAdmin(), (req, res) =>
  //   orgController.deleteOrg(req, res)
  // );

  router.get("/:orgId/members", (req, res) =>
    orgController.getOrgMembers(req, res)
  );

  router.post(
    "/:orgId/members",
    validateRequest(AddOrgMemberSchema),
    (req, res) => orgController.addOrgMember(req, res)
  );

  // router.patch(
  //   "/:orgId/members/:memberId",
  //   guards.requireOrgAdmin(),
  //   validateRequest(UpdateOrgMemberSchema),
  //   (req, res) => orgController.updateOrgMember(req, res)
  // );

  // router.delete("/:orgId/members/:memberId", guards.requireOrgAdmin(), (req, res) =>
  //   orgController.removeOrgMember(req, res)
  // );

  return router;
}

export const orgRoutes = createOrgRoutes();
