import { useEffect, useRef, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { User } from "@shared/schema";
import { setAuthToken } from "@/lib/authToken";
import { apiRequest } from "@/lib/queryClient";

export type AppUser = Omit<User, "authProviderId">;
export type AppAuth = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (options?: { orgCode?: string }) => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  orgCodes: string[];
  getToken: () => Promise<string | undefined>;
  isTokenReady: boolean;
};

type KindeUser = {
  email?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  picture?: string | null;
};

const normalizeStringArrayClaim = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

export const useAuth = (): AppAuth => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getToken,
    getClaim,
    login,
    register,
    logout,
  } = useKindeAuth();
  const [orgCodes, setOrgCodes] = useState<string[]>([]);
  const [isTokenReady, setIsTokenReady] = useState(false);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>();
  const lastUserSyncKey = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthToken(null);
      setOrgCodes([]);
      setIsTokenReady(true);
      setAppUser(null);
      setIsSyncingUser(false);
      setUserRoles([]);
      lastUserSyncKey.current = null;
      return;
    }

    let isActive = true;
    setIsTokenReady(false);
    const loadAuthData = async () => {
      const tokenPromise = getToken()
        .then((token) => token ?? null)
        .catch(() => null);
      const orgCodesPromise = getClaim("org_codes", "idToken")
        .then((claim) => normalizeStringArrayClaim(claim?.value))
        .catch(() => []);
      const rolesPromise = getClaim("roles", "accessToken")
        .then((roles) => (Array.isArray(roles?.value) ? roles.value : []))
        .catch(() => []);

      const [token, codes, roles] = await Promise.all([
        tokenPromise,
        orgCodesPromise,
        rolesPromise,
      ]);

      if (!isActive) return;

      setAuthToken(token);
      setIsTokenReady(true);
      setOrgCodes(codes);
      setUserRoles(roles);
    };

    void loadAuthData();

    return () => {
      isActive = false;
    };
  }, [getClaim, getToken, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isTokenReady || !user) return;

    let isActive = true;
    const kindeUser = user as unknown as KindeUser;
    const role = userRoles?.[0] ?? null;
    const syncKey = [
      kindeUser.email ?? "",
      kindeUser.givenName ?? "",
      kindeUser.familyName ?? "",
      kindeUser.picture ?? "",
      role ?? "",
    ].join("|");

    if (lastUserSyncKey.current === syncKey) {
      return;
    }
    lastUserSyncKey.current = syncKey;

    setIsSyncingUser(true);
    apiRequest("POST", "/api/users/current", {
      email: kindeUser.email ?? null,
      firstName: kindeUser.givenName ?? null,
      lastName: kindeUser.familyName ?? null,
      profileImageUrl: kindeUser.picture ?? null,
      role: userRoles,
    })
      .then((response) => response.json())
      .then((data) => {
        if (isActive) {
          setAppUser(data as AppUser);
        }
      })
      .catch(() => {
        if (isActive) {
          setAppUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsSyncingUser(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isTokenReady, user, userRoles]);

  const isUserReady = !isAuthenticated || (!!appUser && !isSyncingUser);
  const isAuthLoading = isLoading || !isTokenReady || !isUserReady;

  return {
    user: appUser,
    isAuthenticated,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
    orgCodes,
    getToken,
    isTokenReady,
  };
};
