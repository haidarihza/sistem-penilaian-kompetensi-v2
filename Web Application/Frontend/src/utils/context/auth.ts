import { createContext } from "react";
import { AuthData } from "../../interface/auth";

export interface AuthContextInterface {
  isAuthenticated: boolean;
  auth?: AuthData,
  login: (auth: AuthData) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextInterface>({} as AuthContextInterface);