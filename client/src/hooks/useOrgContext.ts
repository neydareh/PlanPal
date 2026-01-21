import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

function getOrgIdFromPath(pathname: string) {
  const match = pathname.match(/^\/orgs\/([^/]+)/);
  return match ? match[1] : null;
}

export function useOrgContext() {
  const { orgCodes } = useAuth();
  // const [location] = useLocation();

  // const orgIdFromPath = useMemo(
  //   () => getOrgIdFromPath(location),
  //   [location]
  // );

  // const  = useMemo(() => {
  //   if (orgIdFromPath && orgCodes.includes(orgIdFromPath)) {
  //     return orgIdFromPath;
  //   }
  //   return orgCodes.length > 0 ? orgCodes[0] : null;
  // }, [orgCodes, orgIdFromPath]);

  return { orgId: orgCodes };
}