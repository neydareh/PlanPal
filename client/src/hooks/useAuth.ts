import { useEffect, useMemo, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { User } from "@shared/schema";
import { setAuthToken } from "@/lib/authToken";

export type AppUser = Omit<User, "authProviderId">;
interface IRole {
  id: string;
  key: "admin" | "user";
  name: string;
}

const toAppUser = (
  kindeUser: Record<string, unknown> | null,
  // roles: IRole | undefined,
): AppUser | null => {
  if (!kindeUser) return null;
  const id = (kindeUser.id as string | undefined) ?? "";
  const email = (kindeUser.email as string | undefined) ?? null;
  const firstName = (kindeUser.givenName as string | undefined) ?? null;
  const lastName = (kindeUser.familyName as string | undefined) ?? null;
  const profileImageUrl = (kindeUser.picture as string | undefined) ?? null;

  // let appUser = {
  //   id,
  //   email,
  //   firstName,
  //   lastName,
  //   role: "admin",
  //   profileImageUrl,
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };

  return {
    id,
    email,
    firstName,
    lastName,
    role: "admin",
    profileImageUrl,
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
    register,
    logout,
  } = useKindeAuth();
  const [orgCodes, setOrgCodes] = useState<string[]>([]);
  const [isTokenReady, setIsTokenReady] = useState(false);
  const [userRoles, setUserRoles] = useState<IRole>();

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthToken(null);
      setOrgCodes([]);
      setIsTokenReady(true);
      return;
    }

    getToken()
      .then((token) => {
        setAuthToken(token ?? null);
        setIsTokenReady(true);
      })
      .catch(() => {
        setAuthToken(null);
        setIsTokenReady(true);
      });

    getClaim("org_codes", "idToken")
      .then((claim) => {
        const codes = Array.isArray(claim?.value) ? claim.value : [];
        setOrgCodes(codes);
      })
      .catch(() => {
        setOrgCodes([]);
      });
      
  }, [getClaim, isAuthenticated]);

  console.log('user roles => ', userRoles, isLoading)

  const mappedUser = useMemo(() => toAppUser(user!), [user]);

  return {
    user: mappedUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    orgCodes,
    getToken,
    isTokenReady,
  };
};
