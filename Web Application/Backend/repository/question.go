package repository

import (
	"context"
	"database/sql"
	"time"
)

type Question struct {
	ID            string
	Question      string
	DurationLimit int
	Deleted       bool
	CreatedAt     time.Time
	UpdatedAt     sql.NullTime
	DeletedAt     sql.NullTime
	Labels        []*QuestionLabel
}

type QuestionLabel struct {
	ID 						string
	QuestionID 		string
	CompetencyID 	string
	Deleted 			bool
	CreatedAt 		time.Time
	UpdatedAt 		sql.NullTime
	DeletedAt 		sql.NullTime
}

type Labels struct {
	IDs 					[]string
	CompetencyIDs []string
}

type QuestionRepository interface {
	Insert(context.Context, *Question, *Labels) error
	SelectAll(context.Context) ([]*Question, error)
	SelectAllByRoomID(context.Context, string) ([]*Question, error)
	SelectOneByID(context.Context, string) (*Question, error)
	Upsert(context.Context, *Question, *Labels) error
	DeleteByID(context.Context, string) error
}
