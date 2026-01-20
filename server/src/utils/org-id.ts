import { Request } from "express";

export const getOrgIdFromRequest = (req: Request): string | undefined => {
  if (req.params?.orgId) {
    return req.params.orgId;
  }

  const match = req.baseUrl?.match(/\/orgs\/([^/]+)/);
  return match?.[1];
};
