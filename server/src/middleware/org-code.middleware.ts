import { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { organizations } from "server/shared/schema";
import { getDb } from "../db";

export const orgCodeMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // let orgCode = req.params.orgId;
  // if (!orgCode) {
  //   return next();
  // }
  let orgCode = "";

  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const payloadPart = token.split(".")[1];
    if (payloadPart) {
      try {
        const payload = JSON.parse(
          Buffer.from(payloadPart, "base64url").toString("utf8")
        );
        const tokenOrgCode = payload?.org_code ?? payload?.orgCode;
        if (typeof tokenOrgCode === "string" && tokenOrgCode) {
          orgCode = tokenOrgCode;
        }
      } catch {
        // ignore malformed token payload
        res.status(401).json({ message: "Bad Authorization Header" })
      }
    }
  }

  const userOrgCodes = (req as any).user?.org_codes;
  if (Array.isArray(userOrgCodes) && !userOrgCodes.includes(orgCode)) {
    return res.status(403).json({ message: "Not a member of this org" });
  }

  const db = getDb();
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.orgCode, orgCode),
  });

  if (!organization) {
    return res.status(404).json({ message: "Organization not found" });
  }

  (req as any).orgId = organization.id;
  (req as any).orgCode = orgCode;
  
  return next();
};
