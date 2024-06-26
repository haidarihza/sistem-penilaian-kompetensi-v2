import { AxiosInstance, isAxiosError } from "axios";
import { RoomAll, RoomDetail } from "../interface/room";
import { ApiError } from "../interface/api";
import { storage } from "./firebaseStorage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function createRoom(
  axios: AxiosInstance,
  title: string,
  description: string,
  start: string,
  end: string,
  interviewee_email: Array<string>,
  questions_id: Array<string>,
  competencies_id: Array<string>,
): Promise<string> {
  try {
    const res = await axios.post("/room", {
      title,
      description,
      start,
      end,
      interviewee_email,
      questions_id,
      competencies_id,
    });

    return res.data.id;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}


export async function getAllRoom(
  axios: AxiosInstance
): Promise<Array<RoomAll>> {
  try {
    const res = await axios.get("/room");

    return res.data.data as Array<RoomAll>;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function getOneRoom(
  axios: AxiosInstance,
  id: string
): Promise<RoomDetail> {
  try {
    const res = await axios.get(`/room/${id}`);

    return res.data.data as RoomDetail;
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function answerQuestion(
  axios: AxiosInstance,
  room_id: string,
  question_id: string,
  answer: Blob
): Promise<void> {
  try {
    const storageRef = ref(storage, `interview-video/answer-${room_id}-${question_id}`);
    const snapshot = await uploadBytes(storageRef, answer);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    console.log('File available at', downloadUrl);    // send to backend

    await axios.post(`/room/${room_id}/${question_id}`, {
      answer_url: downloadUrl
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function finishInterview(
  axios: AxiosInstance,
  room_id: string
): Promise<void> {
  try {
    await axios.post(`/room/${room_id}/finish-answer`);
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function reviewRoom(
  axios: AxiosInstance,
  id: string,
  status: string,
  note: string
): Promise<void> {
  try {
    await axios.post(`/room/${id}/review`, {
      status,
      note,
    })
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function deleteRoom(
  axios: AxiosInstance,
  id: string
): Promise<void> {
  try {
    await axios.delete(`/room/${id}`);
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}