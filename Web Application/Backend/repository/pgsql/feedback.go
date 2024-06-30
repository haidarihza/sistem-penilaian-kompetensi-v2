package pgsql

import (
	"context"
	"database/sql"
	"fmt"
	"interview/summarization/repository"
)

type feedbackRepository struct {
	db *sql.DB
	ps map[string]*sql.Stmt
}

func NewFeedbackRepository(db *sql.DB) (repository.FeedbackRepository, error) {
	ps := make(map[string]*sql.Stmt, len(feedbackQueries))
	for key, query := range feedbackQueries {
		stmt, err := prepareStmt(db, "feedbackRepository", key, query)
		if err != nil {
			return nil, fmt.Errorf("Feedback Repository: %w", err)
		}

		ps[key] = stmt
	}

	return &feedbackRepository{db, ps}, nil
}

var feedbackQueries = map[string]string{
	feedbackInsert: 				feedbackInsertQuery,
	feedbackSelectByStatus: feedbackSelectByStatusQuery,
	feedbackUpdate: 				feedbackUpdateQuery,
	feedbackUpdateBulk: 		feedbackUpdateBulkQuery,
}

const feedbackInsert = "feedbackInsert"
const feedbackInsertQuery = `INSERT INTO
	"feedback_results"(
		id, transcript, competency_id, status, label_result
	) values(
		UNNEST($1::uuid[]), UNNEST($2::text[]), UNNEST($3::uuid[]), $4, UNNEST($5::uuid[])
	)
`

func (r *feedbackRepository) Insert(ctx context.Context, feedbackID []string, transcript []string, cID []string, resID []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	status := "UNLABELED"
	_, err = tx.StmtContext(ctx, r.ps[feedbackInsert]).ExecContext(ctx,
		feedbackID, transcript, cID, status, resID,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

const feedbackSelectByStatus = "feedbackSelectByStatus"
const feedbackSelectByStatusQuery = `SELECT
	id, competency_id, transcript, status, label_result, label_feedback
	FROM "feedback_results"
	WHERE status = $1
`

func (r *feedbackRepository) SelectByStatus(ctx context.Context, status string) ([]*repository.Feedback, error) {
	rows, err := r.ps[feedbackSelectByStatus].QueryContext(ctx, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	feedbacks := []*repository.Feedback{}
	for rows.Next() {
		feedback := &repository.Feedback{}
		err := rows.Scan(&feedback.ID, &feedback.CompetencyID, &feedback.Transcript,
			&feedback.Status, &feedback.LabelResult, &feedback.LabelFeedback)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		feedbacks = append(feedbacks, feedback)
	}

	return feedbacks, nil
}

const feedbackUpdate = "feedbackUpdate"
const feedbackUpdateQuery = `UPDATE "feedback_results"
	SET status = $1, label_feedback = $2
	WHERE id = $3
`

func (r *feedbackRepository) UpdateFeedback(ctx context.Context, feedback *repository.Feedback) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[feedbackUpdate]).ExecContext(ctx, feedback.Status, feedback.LabelFeedback, feedback.ID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

const feedbackUpdateBulk = "feedbackUpdateBulk"
const feedbackUpdateBulkQuery = `UPDATE "feedback_results"
	SET status = $1
	WHERE id = ANY($2::uuid[])
`

func (r *feedbackRepository) UpdateBulkFeedback(ctx context.Context, ids []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	status := "TO_LABEL"
	_, err = tx.StmtContext(ctx, r.ps[feedbackUpdateBulk]).ExecContext(ctx, status, ids)

	return tx.Commit()
}

const feedbackIsNoDataToLabel = "feedbackIsNoDataToLabel"
const feedbackIsNoDataToLabelQuery = `SELECT COUNT(*) = 0
	FROM "feedback_results"
	WHERE status = 'TO_LABEL'
`

func (r *feedbackRepository) IsNoDataToLabel(ctx context.Context) (bool, error) {
	var isNoData bool
	err := r.db.QueryRowContext(ctx, feedbackIsNoDataToLabelQuery).Scan(&isNoData)
	if err != nil {
		return false, err
	}

	return isNoData, nil
}