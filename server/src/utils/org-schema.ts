const ORG_SCHEMA_PREFIX = "org_";

export const toOrgSchemaName = (orgId: string) => {
  const safeId = orgId.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return `${ORG_SCHEMA_PREFIX}${safeId}`;
};

export const provisionOrgSchema = async (
  client: { query: (queryText: string, values?: unknown[]) => Promise<unknown> },
  schemaName: string
) => {
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  await client.query(
    `CREATE TABLE IF NOT EXISTS "${schemaName}".events (LIKE public.events INCLUDING ALL)`
  );
  await client.query(
    `CREATE TABLE IF NOT EXISTS "${schemaName}".songs (LIKE public.songs INCLUDING ALL)`
  );
  await client.query(
    `CREATE TABLE IF NOT EXISTS "${schemaName}".blockouts (LIKE public.blockouts INCLUDING ALL)`
  );
  await client.query(
    `CREATE TABLE IF NOT EXISTS "${schemaName}".event_songs (LIKE public.event_songs INCLUDING ALL)`
  );

  await client.query(
    `ALTER TABLE "${schemaName}".event_songs DROP CONSTRAINT IF EXISTS event_songs_event_id_fkey`
  );
  await client.query(
    `ALTER TABLE "${schemaName}".event_songs DROP CONSTRAINT IF EXISTS event_songs_song_id_fkey`
  );
  await client.query(
    `ALTER TABLE "${schemaName}".event_songs ADD CONSTRAINT event_songs_event_id_fkey FOREIGN KEY (event_id) REFERENCES "${schemaName}".events(id)`
  );
  await client.query(
    `ALTER TABLE "${schemaName}".event_songs ADD CONSTRAINT event_songs_song_id_fkey FOREIGN KEY (song_id) REFERENCES "${schemaName}".songs(id)`
  );
};
