ALTER TABLE organizations ADD COLUMN IF NOT EXISTS schema_name varchar;

CREATE INDEX IF NOT EXISTS IDX_organizations_schema_name
  ON organizations (schema_name);
