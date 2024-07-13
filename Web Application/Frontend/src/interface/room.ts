import { Competency } from "./competency"
import { Question } from "./question"

export interface RoomGroup {
  id: string,
  title: string,
  interviewee_name: string,
  interviewee_email: string,
  interviewee_phone: string,
  org_position: string,
  room: Array<RoomAll>
}
export interface RoomAll {
  id: string,
  title: string,
  interviewer_name: string,
  start: string,
  end: string,
  submission: string,
  status: string
}

export interface RoomDetail {
  id: string,
  title: string,
  description: string,
  interviewer_name: string,
  interviewer_email: string,
  start: string,
  end: string,
  submission: string,
  status: string,
  note: string,
  questions: Array<Question>,
  competencies: Array<Competency>
}

export interface RoomGroupCreate {
  id: string,
  title: string,
  org_position: string,
  interviewee_email: Array<string>,
  room: RoomCreate
}

export interface RoomCreate {
  id: string,
  title: string,
  description: string,
  start: string,
  end: string,
  interviewer_email: string,
  questions_id: Array<string>,
  competencies_id: Array<string>,
  questions: Array<Question>,
  competencies: Array<Competency>
}
export interface RoomReview {
  status: string,
  note: string
}