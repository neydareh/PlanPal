DROP INDEX IF EXISTS IDX_users_auth_provider_id;
ALTER TABLE users DROP COLUMN IF EXISTS auth_provider_id;
