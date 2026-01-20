import { Request, Response, NextFunction } from "express";
import { and, eq } from "drizzle-orm";
import { orgMemberships } from "server/shared/schema";
import { getDb } from "../db";

type OrgRole = "admin" | "member";

function getUserId(req: Request): string | undefined {
  return (req as any).user?.sub;
}

export function requireOrgRole(role: OrgRole, orgIdParam = "orgId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      //TODO: return res.status(401).json({ message: "Authentication required" });
      return next();
    }

    const orgId = req.params[orgIdParam];
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID is required" });
    }

    const db = getDb();
    const membership = await db.query.orgMemberships.findFirst({
      where: and(eq(orgMemberships.orgId, orgId), eq(orgMemberships.userId, userId)),
    });

    if (!membership) {
      return res.status(403).json({ message: "Not a member of this org" });
    }

    if (role === "admin" && membership.role !== "admin") {
      return res.status(403).json({ message: "Admin role required" });
    }

    next();
  };
}

export const requireOrgAdmin = (orgIdParam = "orgId") =>
  requireOrgRole("admin", orgIdParam);

export const requireOrgMember = (orgIdParam = "orgId") =>
  requireOrgRole("member", orgIdParam);
