# Org/Team API Scaffold Plan

## Goals
- Add org, team, and membership API scaffolding (routes, controllers, services).
- Keep wiring consistent with existing patterns in `server/src/routes`, `server/src/controllers`, and `server/src/services`.
- Enforce org-level authorization and role/function validation.

## Assumptions
- Auth middleware already provides the current user (`req.auth` / `req.user`) as in existing routes.
- `org_role` governs org/team management; `user.role` remains global app role.
- Validation uses Zod (via `drizzle-zod` schemas or custom DTOs).

## Database Entities
Reference new tables in `server/shared/schema.ts`:
- `organizations`, `teams`
- `org_memberships`, `team_memberships`
- enums: `org_role`, `member_function`

## Routes to Scaffold
All routes under `/api` and mounted in `server/src/routes/index.ts`.

### Orgs
- `POST /orgs` create org
- `GET /orgs` list orgs for current user
- `GET /orgs/:orgId` org detail (includes teams + member count)
- `PUT /orgs/:orgId` rename org
- `DELETE /orgs/:orgId` delete org (admin only)

### Org Members
- `GET /orgs/:orgId/members` list members
- `POST /orgs/:orgId/members` add member
- `PATCH /orgs/:orgId/members/:memberId` update role
- `DELETE /orgs/:orgId/members/:memberId` remove member

### Teams
- `POST /orgs/:orgId/teams` create team
- `GET /orgs/:orgId/teams` list teams
- `GET /orgs/:orgId/teams/:teamId` team detail
- `PUT /orgs/:orgId/teams/:teamId` rename team
- `DELETE /orgs/:orgId/teams/:teamId` delete team

### Team Members
- `GET /orgs/:orgId/teams/:teamId/members` list team members
- `POST /orgs/:orgId/teams/:teamId/members` add member
- `PATCH /orgs/:orgId/teams/:teamId/members/:memberId` update role/function
- `DELETE /orgs/:orgId/teams/:teamId/members/:memberId` remove member

## Controllers to Add
File: `server/src/controllers/org.controller.ts`
- `createOrg`
- `getOrgs`
- `getOrg`
- `updateOrg`
- `deleteOrg`
- `getOrgMembers`
- `addOrgMember`
- `updateOrgMember`
- `removeOrgMember`

File: `server/src/controllers/team.controller.ts`
- `createTeam`
- `getTeams`
- `getTeam`
- `updateTeam`
- `deleteTeam`
- `getTeamMembers`
- `addTeamMember`
- `updateTeamMember`
- `removeTeamMember`

## Services to Add
File: `server/src/services/org.service.ts`
- `createOrg`
- `getOrgsForUser`
- `getOrgById`
- `updateOrg`
- `deleteOrg`
- `listOrgMembers`
- `addOrgMember`
- `updateOrgMemberRole`
- `removeOrgMember`

File: `server/src/services/team.service.ts`
- `createTeam`
- `getTeamsForOrg`
- `getTeamById`
- `updateTeam`
- `deleteTeam`
- `listTeamMembers`
- `addTeamMember`
- `updateTeamMember`
- `removeTeamMember`

## DTOs + Validation
File: `server/src/interfaces/dto.ts`
- `CreateOrgDto`, `UpdateOrgDto`
- `CreateTeamDto`, `UpdateTeamDto`
- `AddOrgMemberDto`, `UpdateOrgMemberDto`
- `AddTeamMemberDto`, `UpdateTeamMemberDto`

Validation rules:
- `memberFunction` required when `role === "member"`.
- `memberFunction` must be null/undefined for `role === "admin"`.
- Ensure user is member of org before allowing team actions.

## Middleware / AuthZ
Add org-role checks:
- New middleware helper in `server/src/middleware/role.middleware.ts` or a new `org-role.middleware.ts`:
  - `requireOrgAdmin(orgIdParam = "orgId")`
  - `requireOrgMember(orgIdParam = "orgId")`
- For team routes, verify team belongs to org and user is org member.

## API Wiring
- Add `org.routes.ts` and `team.routes.ts`
- Register in `server/src/routes/index.ts`

## Error Handling
Use `server/src/utils/errors.ts`:
- 404 for missing org/team/member
- 403 for unauthorized access
- 409 for duplicate membership

## Testing (Basic)
Add to `server/tests`:
- org CRUD
- org member role updates
- team CRUD
- team member role/function validation

