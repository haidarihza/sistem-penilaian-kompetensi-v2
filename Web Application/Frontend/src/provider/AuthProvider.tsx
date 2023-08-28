import { ReactNode, useEffect, useState } from "react";
import { AuthContext, AuthContextInterface } from "../utils/context/auth";
import { AuthData } from "../interface/auth";

interface Props {
  children?: ReactNode
}

const AuthProvider = ({ children } : Props) => {
  const isAuthenticatedKey = "is_authenticated";
  const authDataKey = "auth_data";
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [auth, setAuth] = useState<AuthData>({} as AuthData);

  const login = (auth: AuthData) => {
    setIsAuthenticated(true);
    setAuth(auth);

    localStorage.setItem(isAuthenticatedKey, "true");
    localStorage.setItem(authDataKey, JSON.stringify(auth));
  }

  const logout = () => {
    setIsAuthenticated(false);
    setAuth({} as AuthData);

    localStorage.removeItem(isAuthenticatedKey);
    localStorage.removeItem(authDataKey);
  }

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem(isAuthenticatedKey) === "true");
    const authData = localStorage.getItem(authDataKey);
    if (authData) {
      setAuth(JSON.parse(authData));
    }
  }, []);

  const authContext: AuthContextInterface = {
    isAuthenticated,
    auth,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;