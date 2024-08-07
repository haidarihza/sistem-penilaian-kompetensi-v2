import { AxiosInstance, isAxiosError } from "axios";
import { RoomGroup, RoomAll, RoomDetail, RoomCreate, RoomGroupCreate } from "../interface/room";
import { ApiError } from "../interface/api";
import { storage } from "./firebaseStorage";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Question } from "../interface/question";

export async function createRoomGroup(
  axios: AxiosInstance,
  org_position: string,
  interviewee_email: Array<string>,
  room: RoomCreate
): Promise<string> {
  try {
    room.competencies_id = room.competencies.map((competency) => competency.id);
    room.questions_id = room.questions.map((question) => question.id);
    const res = await axios.post("/room/group", {
      org_position,
      interviewee_email,
      room: {
        title: room.title,
        description: room.description,
        start: new Date(room.start),
        end: new Date(room.end),
        interviewer_email: room.interviewer_email,
        language: room.language,
        preparation_time: room.preparation_time,
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
      language: room.language,
      preparation_time: room.preparation_time,
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

export async function getQuestionDetail(
  axios: AxiosInstance,
  room_id: string,
  question_id: string,
): Promise<Question> {
  try{
    const res = await axios.get(`/room/get-question/${room_id}/${question_id}`)
    return res.data.data as Question
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function updateRoomQuestion(
  axios: AxiosInstance,
  room_id: string,
  question_id: string,
  start_answer: Date,
  is_started: boolean,
  current_question: number
) : Promise<void> {
  try{
    await axios.put(`/room/update-current-question/${room_id}/${question_id}`, {
      start_answer,
      is_started,
      current_question
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}

export async function uploadToStorage(
  video: Blob,
  room_id: string,
  question_id: string
): Promise<string> {
  try {
    const storageRef = ref(storage, `interview-video/answer-${room_id}-${question_id}`);
    const snapshot = await uploadBytes(storageRef, video);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (e) {
    console.log(e)
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
  link: string,
  language: string
): Promise<void> {
  try {
    await axios.post(`/room/${room_id}/${question_id}`, {
      answer_url: link,
      language
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

export async function updateQuestionsCompetencies(
  axios: AxiosInstance,
  roomGroup: RoomGroupCreate
) : Promise<void> {
  try {
    await axios.post(`/room/update-questions-competencies`, {
      id: roomGroup.room.id,
      title: roomGroup.room.title,
      description: roomGroup.room.description,
      start: new Date(roomGroup.room.start),
      end: new Date(roomGroup.room.end),
      interviewer_email: roomGroup.room.interviewer_email,
      interviewee_email: roomGroup.interviewee_email[0],
      questions_id: roomGroup.room.questions.map((question) => question.id),
      competencies_id: roomGroup.room.competencies.map((competency) => competency.id),
    });
  } catch (e) {
    if (isAxiosError(e)) {
      throw new ApiError(e.response?.data.message ? 
        e.response?.data.message : "Something Went Wrong");
    }

    throw new ApiError("Something Went Wrong");
  }
}