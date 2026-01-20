import { NextFunction, Request, Response } from "express";
import { pool, withDbClient } from "../db";
import { provisionOrgSchema, toOrgSchemaName } from "../utils/org-schema";

export const orgSchemaMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orgId = req.params.orgId;
  if (!orgId) {
    return next();
  }

  const client = await pool.connect();
  let released = false;
  const releaseClient = () => {
    if (released) return;
    released = true;
    client.query("RESET search_path").finally(() => {
      console.log('successfully ran query')
      client.release();
    });
  };

  console.log('currently in org-schema middle')

  res.on("finish", releaseClient);
  res.on("close", releaseClient);

  try {
    const { rows } = await client.query(
      "SELECT schema_name FROM organizations WHERE id = $1",
      [orgId]
    );
    console.log('rows => ', rows)

    if (rows.length === 0) {
      releaseClient();
      return res.status(404).json({ message: "Organization not found" });
    }

    let schemaName = rows[0]?.schema_name as string | null;
    if (!schemaName) {
      schemaName = toOrgSchemaName(orgId);
      await provisionOrgSchema(client, schemaName);
      await client.query(
        "UPDATE organizations SET schema_name = $1 WHERE id = $2",
        [schemaName, orgId]
      );
    }

    await client.query(`SET search_path TO "${schemaName}", public`);

    await withDbClient(client, async () => {
      next();
    });
  } catch (error) {
    releaseClient();
    next(error);
  }
};
