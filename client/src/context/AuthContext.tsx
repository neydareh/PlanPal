import { createContext, ReactNode, useContext } from "react";
import { AppAuth, useAuth } from "@/hooks/useAuth";

const AuthContext = createContext<AppAuth | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthContextProvider");
  }
  return context;
};
