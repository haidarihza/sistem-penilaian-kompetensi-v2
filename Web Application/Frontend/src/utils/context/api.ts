import { AxiosInstance } from "axios";
import { createContext } from "react";

export interface APIContextInterface {
  axios: AxiosInstance;
}

export const ApiContext = createContext<APIContextInterface>({} as APIContextInterface);