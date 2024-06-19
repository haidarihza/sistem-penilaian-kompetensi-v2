CREATE TABLE IF NOT EXISTS users(
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS rooms(
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  "start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  submission TIMESTAMP WITH TIME ZONE,
  status TEXT,
  note TEXT,
  interviewer_id UUID,
  interviewee_id UUID,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY(interviewer_id) REFERENCES users(id),
  FOREIGN KEY(interviewee_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions(
  id UUID PRIMARY KEY,
  question TEXT NOT NULL,
  duration_limit INT NOT NULL,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS rooms_has_questions(
  room_id UUID,
  question_id UUID,
  transcript TEXT,
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(question_id) REFERENCES questions(id),
  PRIMARY KEY(room_id, question_id)
);

CREATE TABLE IF NOT EXISTS competencies(
  id UUID PRIMARY KEY,
  competency TEXT NOT NULL,
  description TEXT NOT NULL,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS rooms_has_competencies(
  room_id UUID,
  competency_id UUID,
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  FOREIGN KEY(competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS competency_levels(
  id UUID PRIMARY KEY,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  competency_id UUID,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY(competency_id) REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS results_competencies(
  room_id UUID,
  competency TEXT NOT NULL,
  level TEXT NOT NULL,
  result REAL NOT NULL,
  FOREIGN KEY(room_id) REFERENCES rooms(id),
  PRIMARY KEY(room_id, competency, level)
);

CREATE TABLE IF NOT EXISTS questions_labels(
  id UUID PRIMARY KEY,
  question_id UUID,
  competency_id UUID,
  deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY(competency_id) REFERENCES competencies(id),
  FOREIGN KEY(question_id) REFERENCES questions(id)
);

CREATE TABLE IF NOT EXISTS feedback_results(
  id UUID PRIMARY KEY,
  transcript TEXT,
  competency_id UUID,
  status TEXT,
  label_result TEXT,
  label_feedback TEXT,
  FOREIGN KEY(competency_id) REFERENCES competencies(id)
);
