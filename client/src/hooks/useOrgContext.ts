import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@/context/AuthContext";

function getOrgIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/orgs\/([^/]+)/);
  return match ? match[1] : null;
}

export function useOrgContext() {
  const { orgCodes } = useAuthContext();
  const [location] = useLocation();

  const orgIdFromPath = useMemo(() => getOrgIdFromPath(location), [location]);

  const orgId = useMemo(() => {
    if (orgIdFromPath && orgCodes.includes(orgIdFromPath)) {
      return orgIdFromPath;
    }
    return orgCodes.length > 0 ? orgCodes[0] : null;
  }, [orgCodes, orgIdFromPath]);

  return { orgId };
}
