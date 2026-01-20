import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";

const STORAGE_KEY = "currentOrgId";

function getOrgIdFromPath(pathname: string) {
  const match = pathname.match(/^\/orgs\/([^/]+)/);
  return match ? match[1] : null;
}

export function useOrgContext() {
  const [location] = useLocation();

  const orgIdFromPath = useMemo(
    () => getOrgIdFromPath(location),
    [location]
  );

  useEffect(() => {
    if (orgIdFromPath) {
      localStorage.setItem(STORAGE_KEY, orgIdFromPath);
    }
  }, [orgIdFromPath]);

  const storedOrgId =
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;

  const orgId = orgIdFromPath ?? storedOrgId;

  const setOrgId = (nextOrgId: string) => {
    localStorage.setItem(STORAGE_KEY, nextOrgId);
  };

  return { orgId, setOrgId };
}
