export interface QuestionLabel {
  id: string,
  competency_id: string,
}

export interface Question {
  id: string,
  question: string,
  duration_limit: number,
  org_position: string,
  transcript?: string
  labels: QuestionLabel[]
}

export interface QuestionLabelOptions {
  id : string,
  competency: string
}