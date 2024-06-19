package repository

import (
	"context"
	"database/sql"
)

type FeedbackStatus string

const (
	NoNeedFeedback = FeedbackStatus("NO_NEED_FEEDBACK")
	NeedFeedback = FeedbackStatus("NEED_FEEDBACK")
	Reviewed = FeedbackStatus("REVIEWED")
)

func FeedbackStatusMapper(status string) (FeedbackStatus, bool) {
	mapper := map[string]FeedbackStatus{
		"NO_NEED_FEEDBACK": NoNeedFeedback,
		"NEED_FEEDBACK": NeedFeedback,
		"REVIEWED": Reviewed,
	}

	feedbackStatus, ok := mapper[status]
	return feedbackStatus, ok
}

type Feedback struct {
	ID            	string
	CompetencyID		string
	Transcript 			string
	Status 					FeedbackStatus
	LabelResult 		string
	LabelFeedback		sql.NullString
}	

type FeedbackRepository interface {
	Insert(context.Context, *Feedback) error
	SelectByStatus(context.Context, string) ([]*Feedback, error)
	UpdateFeedback(context.Context, *Feedback) error
	UpdateBulkFeedback(context.Context, []*Feedback) error
}