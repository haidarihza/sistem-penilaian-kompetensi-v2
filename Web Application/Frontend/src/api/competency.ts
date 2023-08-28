import { AxiosInstance, isAxiosError } from "axios";
import { ApiError } from "../interface/api";
import { Competency, CompetencyLevel } from "../interface/competency";

export async function createCompetency(
  axios: AxiosInstance,
  competency: string,
  levels: CompetencyLevel[]
): Promise<void> {
  try {
    await axios.post("/competency", {
      competency,
      levels,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function getAllCompetency(
  axios: AxiosInstance
): Promise<Array<Competency>> {
  try {
    const res = await axios.get("/competency");

    return res.data.data as Array<Competency>;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function getOneCompetency(
  axios: AxiosInstance,
  id: string
): Promise<Competency> {
  try {
    const res = await axios.get(`/competency/${id}`);

    return res.data.data as Competency;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function updateCompetency(
  axios: AxiosInstance,
  id: string,
  competency: string,
  levels: CompetencyLevel[]
): Promise<void> {
  try {
    await axios.put(`/competency/${id}`, {
      competency,
      levels,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function deleteCompetency(
  axios: AxiosInstance,
  id: string
): Promise<void> {
  try {
    await axios.delete(`/competency/${id}`);
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}