import Axios from "axios"
import { ReactNode, useContext } from "react";
import { APIContextInterface, ApiContext } from "../utils/context/api";
import { AuthContext } from "../utils/context/auth";

interface Props {
  children?: ReactNode
}

const APIProvider = ({ children } : Props) => {
  const authContext = useContext(AuthContext);
  
  const axiosInstance = Axios.create({
    baseURL: import.meta.env.VITE_APP_API_HOST,
  });
  
  axiosInstance.interceptors.request.use(config => {
    if (authContext.isAuthenticated) {
      config.headers.Authorization = `Bearer ${authContext.auth?.access_token.token}`;
    }
    
    return config;
  });

  axiosInstance.interceptors.response.use(res => {
    return res
  }, err => {
    if (err.response.status === 401 && authContext.isAuthenticated) {
      authContext.logout();
    }
  })
  
  const apiContext: APIContextInterface = {
    axios: axiosInstance,
  }

  return (
    <ApiContext.Provider value={apiContext}>
      {children}
    </ApiContext.Provider>
  );
}

export default APIProvider;