import { AxiosInstance, isAxiosError } from "axios";
import { ApiError } from "../interface/api";
import { Question } from "../interface/question";

export async function createQuestion(
  axios: AxiosInstance,
  question: string, 
  duration_limit: number
): Promise<void> {
  try {
    await axios.post("/question", {
      question,
      duration_limit,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function getAllQuestion(
  axios: AxiosInstance
): Promise<Array<Question>> {
  try {
    const res = await axios.get("/question");

    return res.data.data as Array<Question>;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function getOneQuestion(
  axios: AxiosInstance,
  id: string
): Promise<Question> {
  try {
    const res = await axios.get(`/question/${id}`);

    return res.data.data as Question;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function updateQuestion(
  axios: AxiosInstance,
  id: string,
  question: string, 
  duration_limit: number
): Promise<void> {
  try {
    await axios.put(`/question/${id}`, {
      question,
      duration_limit,
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function deleteQuestion(
  axios: AxiosInstance,
  id: string
): Promise<void> {
  try {
    await axios.delete(`/question/${id}`);
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}