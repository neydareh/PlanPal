ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_org_id_organizations_id_fk";
ALTER TABLE "songs" DROP CONSTRAINT IF EXISTS "songs_org_id_organizations_id_fk";
ALTER TABLE "blockouts" DROP CONSTRAINT IF EXISTS "blockouts_org_id_organizations_id_fk";
DROP INDEX IF EXISTS "IDX_events_org_id";
DROP INDEX IF EXISTS "IDX_songs_org_id";
DROP INDEX IF EXISTS "IDX_blockouts_org_id";
ALTER TABLE "events" DROP COLUMN IF EXISTS "org_id";
ALTER TABLE "songs" DROP COLUMN IF EXISTS "org_id";
ALTER TABLE "blockouts" DROP COLUMN IF EXISTS "org_id";
