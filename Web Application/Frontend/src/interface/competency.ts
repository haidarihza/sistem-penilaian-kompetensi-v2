export interface CompetencyLevel {
  id: string,
  level: string,
  description: string,
  result?: string
}

export interface Competency {
  id: string,
  competency: string,
  levels: CompetencyLevel[]
}