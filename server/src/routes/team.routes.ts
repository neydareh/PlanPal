// import { Router } from "express";
// import { TeamController } from "../controllers/team.controller";
// import { TeamService } from "../services/team.service";
// import { OrgService } from "../services/org.service";
// import { validateRequest } from "../middleware/validation.middleware";
// import {
//   AddTeamMemberSchema,
//   CreateTeamSchema,
//   UpdateTeamMemberSchema,
//   UpdateTeamSchema,
// } from "../interfaces/dto";
// import { requireOrgAdmin, requireOrgMember } from "../middleware/org-role.middleware";

// type TeamRouteGuards = {
//   requireOrgAdmin: (orgIdParam?: string) => any;
//   requireOrgMember: (orgIdParam?: string) => any;
// };

// export function createTeamRoutes(
//   teamService = new TeamService(),
//   orgService = new OrgService(),
//   guards: TeamRouteGuards = { requireOrgAdmin, requireOrgMember }
// ) {
//   const router = Router();
//   const teamController = new TeamController(teamService, orgService);

//   router.get("/:orgId/teams", guards.requireOrgMember(), (req, res) =>
//     teamController.getTeams(req, res)
//   );
//   router.post(
//     "/:orgId/teams",
//     guards.requireOrgAdmin(),
//     validateRequest(CreateTeamSchema),
//     (req, res) => teamController.createTeam(req, res)
//   );
//   router.get("/:orgId/teams/:teamId", guards.requireOrgMember(), (req, res) =>
//     teamController.getTeam(req, res)
//   );
//   router.put(
//     "/:orgId/teams/:teamId",
//     guards.requireOrgAdmin(),
//     validateRequest(UpdateTeamSchema),
//     (req, res) => teamController.updateTeam(req, res)
//   );
//   router.delete("/:orgId/teams/:teamId", guards.requireOrgAdmin(), (req, res) =>
//     teamController.deleteTeam(req, res)
//   );

//   router.get(
//     "/:orgId/teams/:teamId/members",
//     guards.requireOrgMember(),
//     (req, res) => teamController.getTeamMembers(req, res)
//   );
//   router.post(
//     "/:orgId/teams/:teamId/members",
//     guards.requireOrgAdmin(),
//     validateRequest(AddTeamMemberSchema),
//     (req, res) => teamController.addTeamMember(req, res)
//   );
//   router.patch(
//     "/:orgId/teams/:teamId/members/:memberId",
//     guards.requireOrgAdmin(),
//     validateRequest(UpdateTeamMemberSchema),
//     (req, res) => teamController.updateTeamMember(req, res)
//   );
//   router.delete(
//     "/:orgId/teams/:teamId/members/:memberId",
//     guards.requireOrgAdmin(),
//     (req, res) => teamController.removeTeamMember(req, res)
//   );

//   return router;
// }

// export const teamRoutes = createTeamRoutes();
