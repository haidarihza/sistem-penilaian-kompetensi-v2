package repository

import (
	"context"
	"database/sql"
	"time"
)

type Competency struct {
	ID         string
	Competency string
	Deleted    bool
	CreatedAt  time.Time
	UpdatedAt  sql.NullTime
	DeletedAt  sql.NullTime
	Levels     []*CompetencyLevel
}

type CompetencyLevel struct {
	ID           string
	CompetencyID string
	Level        string
	Description  string
	Deleted      bool
	CreatedAt    time.Time
	UpdatedAt    sql.NullTime
	DeletedAt    sql.NullTime
}

type Levels struct {
	IDs          []string
	Levels       []string
	Descriptions []string
}

type CompetencyRepository interface {
	Insert(context.Context, *Competency, *Levels) error
	SelectAll(context.Context) ([]*Competency, error)
	SelectAllByRoomID(context.Context, string) ([]*Competency, error)
	SelectOneByID(context.Context, string) (*Competency, error)
	Upsert(context.Context, *Competency, *Levels) error
	DeleteByID(context.Context, string) error
}
