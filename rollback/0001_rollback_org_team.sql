-- Rollback for org/team feature tables and enums.
DROP TABLE IF EXISTS "team_memberships";
DROP TABLE IF EXISTS "org_memberships";
DROP TABLE IF EXISTS "teams";
DROP TABLE IF EXISTS "organizations";
DROP TYPE IF EXISTS "member_function";
DROP TYPE IF EXISTS "org_role";
