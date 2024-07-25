package repository

import (
	"context"
	"database/sql"
)

type FeedbackStatus string

const (
	UnLabeled = FeedbackStatus("UNLABELED")
	ToLabel = FeedbackStatus("TO_LABEL")
	Labeled = FeedbackStatus("LABELED")
)

func FeedbackStatusMapper(status string) (FeedbackStatus, bool) {
	mapper := map[string]FeedbackStatus{
		"UNLABELED": UnLabeled,
		"TO_LABEL": 	ToLabel,
		"LABELED": 	Labeled,
	}

	feedbackStatus, ok := mapper[status]
	return feedbackStatus, ok
}

type Feedback struct {
	ID            	string
	CompetencyID		string
	Transcript 			string
	Language 				string
	Status 					FeedbackStatus
	LabelResult 		string
	LabelFeedback		sql.NullString
}	

type FeedbackRepository interface {
	Insert(context.Context, []string, []string, []string, []string, string) error
	SelectByStatus(context.Context, string) ([]*Feedback, error)
	UpdateFeedback(context.Context, *Feedback) error
	UpdateBulkFeedback(context.Context, []string) error
	IsNoDataToLabel(context.Context) (bool, error)
}