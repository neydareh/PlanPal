import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { AsyncLocalStorage } from "node:async_hooks";
import { config } from '../config';
import * as schema from "server/shared/schema";

import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const rejectUnauthorized: boolean = !!process.env.NODE_TLS_REJECT_UNAUTHORIZED || false

// Create a connection pool
export const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.poolSize,
  idleTimeoutMillis: config.database.idleTimeout,
  // SSL configuration if needed
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized 
  } : undefined
});

// Add event listeners for monitoring
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('New database connection established');
});

// Export the drizzle instance
const baseDb = drizzle({ client: pool, schema });
export const db = baseDb;

type PoolClient = Awaited<ReturnType<typeof pool.connect>>;

const dbContext = new AsyncLocalStorage<typeof baseDb>();

export const getDb = () => dbContext.getStore() ?? baseDb;

export const withDbClient = async <T>(
  client: PoolClient,
  callback: () => Promise<T>
) => {
  const scopedDb = drizzle({ client, schema });
  return dbContext.run(scopedDb, callback);
};

export const withPoolClient = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
};

// Utility function to get a client from the pool
export async function withTransaction<T>(
  callback: (client: unknown) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
