import { useEffect, useMemo, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { User } from "@shared/schema";
import { setAuthToken } from "@/lib/authToken";

const toAppUser = (kindeUser: Record<string, unknown> | null): User | null => {
  if (!kindeUser) return null;
  const id = (kindeUser.id as string | undefined) ?? "";
  const email = (kindeUser.email as string | undefined) ?? null;
  const firstName = (kindeUser.given_name as string | undefined) ?? null;
  const lastName = (kindeUser.family_name as string | undefined) ?? null;
  const profileImageUrl = (kindeUser.picture as string | undefined) ?? null;

  return {
    id,
    email,
    firstName,
    lastName,
    profileImageUrl,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getToken,
    getClaim,
    login,
    logout,
  } = useKindeAuth();
  const [orgCodes, setOrgCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthToken(null);
      setOrgCodes([]);
      return;
    }

    getToken()
      .then((token) => {
        setAuthToken(token ?? null);
      })
      .catch(() => {
        setAuthToken(null);
      });

    getClaim("org_codes", "idToken")
      .then((claim) => {
        const codes = Array.isArray(claim?.value) ? claim.value : [];
        setOrgCodes(codes);
      })
      .catch(() => {
        setOrgCodes([]);
      });
  }, [getClaim, getToken, isAuthenticated]);

  const mappedUser = useMemo(() => toAppUser(user ?? null), [user]);

  return {
    user: mappedUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    orgCodes,
    getToken,
  };
};
