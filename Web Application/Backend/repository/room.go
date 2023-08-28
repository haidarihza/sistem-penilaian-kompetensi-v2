package repository

import (
	"context"
	"database/sql"
	"time"
)

type Room struct {
	ID            string
	InterviewerID string
	IntervieweeID string
	Title         string
	Description   string
	Start         string
	End           string
	Submission    sql.NullString
	Status        string
	Note          sql.NullString
	Deleted       bool
	CreatedAt     time.Time
	UpdatedAt     sql.NullTime
	DeletedAt     sql.NullTime
	Interviewer   *User
	Interviewee   *User
}

type ResultCompetency map[string]map[string]float64

type ResultQuestion map[string]string

type RoomRepository interface {
	Insert(context.Context, *Room, []string, []string) (string, error)
	SelectAllByInterviewerID(context.Context, string) ([]*Room, error)
	SelectAllByIntervieweeID(context.Context, string) ([]*Room, error)
	SelectOneByIDUserID(context.Context, string, string) (*Room, error)
	InsertTranscript(context.Context, string, string, string) error
	IsAnswered(context.Context, string) (bool, error)
	GetAnswers(context.Context, string) (string, error)
	InsertResult(context.Context, string, []string, []string, []float64) error
	GetResultCompetencies(context.Context, string) (ResultCompetency, error)
	GetResultQuestions(context.Context, string) (ResultQuestion, error)
	Review(context.Context, *Room) error
}
