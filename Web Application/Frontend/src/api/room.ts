import { AxiosInstance, isAxiosError } from "axios";
import { RoomGroup, RoomAll, RoomDetail, RoomCreate } from "../interface/room";
import { ApiError } from "../interface/api";
import { storage } from "./firebaseStorage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function createRoomGroup(
  axios: AxiosInstance,
  title: string,
  org_position: string,
  interviewee_email: Array<string>,
  room: RoomCreate
): Promise<string> {
  try {
    room.competencies_id = room.competencies.map((competency) => competency.id);
    room.questions_id = room.questions.map((question) => question.id);
    const res = await axios.post("/room/group", {
      title,
      org_position,
      interviewee_email,
      room: {
        title: room.title,
        description: room.description,
        start: new Date(room.start),
        end: new Date(room.end),
        interviewer_email: room.interviewer_email,
        questions_id: room.questions_id,
        competencies_id: room.competencies_id,
      }
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

export async function createRoom(
  axios: AxiosInstance,
  room: RoomCreate,
  room_group_id: string,
  interviewee_email: string,
): Promise<string> {
  room.competencies_id = room.competencies.map((competency) => competency.id);
  room.questions_id = room.questions.map((question) => question.id);
  try {
    const res = await axios.post("/room", {
      title: room.title,
      description: room.description,
      start: new Date(room.start),
      end: new Date(room.end),
      room_group_id,
      interviewer_email: room.interviewer_email,
      interviewee_email,
      questions_id: room.questions_id,
      competencies_id: room.competencies_id,
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

export async function getAllRoomGroup(
  axios: AxiosInstance
): Promise<Array<RoomGroup>> {
  try {
    const res = await axios.get("/room/group");

    return res.data.data as Array<RoomGroup>;
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

export async function getOneRoomGroup(
  axios: AxiosInstance,
  id: string
): Promise<RoomGroup> {
  try {
    const res = await axios.get(`/room/group/${id}`);
    return res.data.data as RoomGroup;
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