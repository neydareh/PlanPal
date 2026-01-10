import { createContext, useContext, ReactNode } from "react";
import {
  Auth0Provider,
  Auth0ProviderOptions,
  useAuth0,
  User,
} from "@auth0/auth0-react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState | null>(null);

const AuthStateProvider = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } =
    useAuth0();

  if (!user) {
    return;
  }

  const getToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error("Failed to fetch access token", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

interface IAuthProviderProps {
  children: ReactNode;
  auth0Props: Auth0ProviderOptions;
}

const AuthProvider = ({ children, auth0Props }: IAuthProviderProps) => {
  return (
    <Auth0Provider {...auth0Props}>
      <AuthStateProvider>{children}</AuthStateProvider>
    </Auth0Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
