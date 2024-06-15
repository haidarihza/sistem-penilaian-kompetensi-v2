import { Competency } from "./competency"
import { Question } from "./question"

export interface RoomAll {
  id: string,
  title: string,
  interviewee_name: string,
  start: string,
  end: string,
  submission: string,
  status: string
}

export interface RoomDetail {
  id: string,
  title: string,
  description: string,
  interviewee_name: string,
  interviewee_phone: string,
  interviewee_email: string,
  start: string,
  end: string,
  submission: string,
  status: string,
  note: string,
  questions: Array<Question>,
  competencies: Array<Competency>
}

export interface RoomCreate {
  id: string,
  title: string,
  description: string,
  start: string,
  end: string,
  interview_email: Array<string>,
  questions: Array<Question>,
  competencies: Array<Competency>
}
export interface RoomReview {
  status: string,
  note: string
}