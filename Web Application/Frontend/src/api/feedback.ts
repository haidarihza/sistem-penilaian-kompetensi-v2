import { AxiosInstance, isAxiosError } from "axios";
import { ApiError } from "../interface/api";
import { Feedback } from "../interface/feedback";

export async function getAllFeedback(
  axios: AxiosInstance
): Promise<Array<Feedback>> {
  try {
    const res = await axios.get("/feedback");

    return res.data.data as Array<Feedback>;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function updateFeedback(
  axios: AxiosInstance,
  feedback: Feedback
): Promise<Feedback> {
  try {
    const res = await axios.put(`/feedback/${feedback.id}`, feedback);

    return res.data.data as Feedback;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}