DROP INDEX IF EXISTS IDX_organizations_org_code;
ALTER TABLE organizations DROP COLUMN IF EXISTS org_code;
