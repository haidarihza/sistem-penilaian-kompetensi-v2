package repository

import (
	"context"
	"database/sql"
	"time"
)

type RoomStatus string

const (
	WaitingAnswer = RoomStatus("WAITING ANSWER")
	WaitingReview = RoomStatus("WAITING REVIEW")
	Accepted = RoomStatus("ACCEPTED")
	Rejected = RoomStatus("REJECTED")
	Completed = RoomStatus("COMPLETED")
)

func RoomStatusMapper(status string) (RoomStatus, bool) {
	mapper := map[string]RoomStatus{
		"WAITING ANSWER":   WaitingAnswer,
		"WAITING REVIEW":   WaitingReview,
		"COMPLETED": 				Completed,
		"ACCEPTED":					Accepted,
		"REJECTED":					Rejected,
	}

	roomStatus, ok := mapper[status]
	return roomStatus, ok
}

type RoomGroup struct {
	ID        		string
	Title 	 			string
	OrgPosition 	string
	IntervieweeID string
	Rooms 				[]*Room
	Interviewee 	*User
}

type Room struct {
	ID            string
	InterviewerID string
	RoomGroupID   string
	Title         string
	Description   string
	Start         string
	End           string
	Submission    sql.NullString
	Status        RoomStatus
	Note          sql.NullString
	Language			string
	Deleted       bool
	CreatedAt     time.Time
	UpdatedAt     sql.NullTime
	DeletedAt     sql.NullTime
	Interviewer   *User
}

type ResultCompetency map[string]map[string]float64

type ResultQuestion map[string]string

type RoomRepository interface {
	InsertRoomGroup(context.Context, *RoomGroup) error
	Insert(context.Context, *Room, []string, []string) error
	SelectAllRoomGroupByInterviewerID(context.Context, string) ([]*RoomGroup, error)
	SelectAllRoomGroupByIntervieweeID(context.Context, string) ([]*RoomGroup, error)
	SelectAllRoomByGroupID(context.Context, string) ([]*Room, error)
	SelectRoomGroupByID(context.Context, string) (*RoomGroup, error)
	SelectOneRoomByID(context.Context, string) (*Room, error)
	InsertTranscript(context.Context, string, string, string, string) error
	IsAnswered(context.Context, string) (bool, error)
	GetAnswers(context.Context, string) (string, error)
	InsertResult(context.Context, string, []string, []string, []float64) error
	GetResultCompetencies(context.Context, string) (ResultCompetency, error)
	GetResultQuestions(context.Context, string) (ResultQuestion, error)
	UpdateStatusAndSubmission(context.Context, *Room) error
	Review(context.Context, *Room) error
	DeleteByID(context.Context, string, string) error
}
