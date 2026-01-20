DROP INDEX IF EXISTS IDX_organizations_schema_name;
ALTER TABLE organizations DROP COLUMN IF EXISTS schema_name;
