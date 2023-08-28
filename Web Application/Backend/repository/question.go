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
}

type QuestionRepository interface {
	Insert(context.Context, *Question) error
	SelectAll(context.Context) ([]*Question, error)
	SelectAllByRoomID(context.Context, string) ([]*Question, error)
	SelectOneByID(context.Context, string) (*Question, error)
	Update(context.Context, *Question) error
	DeleteByID(context.Context, string) error
}
