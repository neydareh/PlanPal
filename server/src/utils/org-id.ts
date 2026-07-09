import { Request } from "express";

type RequestWithOrgId = Request & { orgId?: string };

export const getOrgIdFromRequest = (req: RequestWithOrgId): string | undefined =>
  req.orgId ?? req.params.orgId;
