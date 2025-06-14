// import * as React from 'react';
import { useState, createContext, useEffect, type ReactNode } from 'react';
import { User} from "oidc-client-ts";
import { userManager } from "./config/authConfig";


interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;

}



export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    userManager.getUser().then((loadedUser) => {
      setUser(loadedUser);
    });
  }, []);

  const login = () => {
    userManager.signinRedirect();
  };

  const logout = () => {
    userManager.signoutRedirect();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
