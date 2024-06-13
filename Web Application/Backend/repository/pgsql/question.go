package pgsql

import (
	"context"
	"database/sql"
	"fmt"
	"interview/summarization/repository"
	"time"
)

type questionRepository struct {
	db *sql.DB
	ps map[string]*sql.Stmt
}

func NewQuestionRepository(db *sql.DB) (repository.QuestionRepository, error) {
	ps := make(map[string]*sql.Stmt, len(questionQueries))
	for key, query := range questionQueries {
		stmt, err := prepareStmt(db, "questionRepository", key, query)
		if err != nil {
			return nil, fmt.Errorf("Question Repository: %w", err)
		}

		ps[key] = stmt
	}

	return &questionRepository{db, ps}, nil
}

var questionQueries = map[string]string{
	questionInsert:            		questionInsertQuery,
	questionLabelInsert:       		questionLabelInsertQuery,
	questionSelectAll:         		questionSelectAllQuery,
	questionSelectAllByRoomID: 		questionSelectAllByRoomIDQuery,
	questionSelectOne:         		questionSelectOneQuery,
	questionUpdate:            		questionUpdateQuery,
	questionLabelUpsert:       		questionLabelUpsertQuery,
	questionLabelDeleteNotInList: questionLabelDeleteNotInListQuery,
	questionDelete:            		questionDeleteQuery,
	questionLabelDelete:       		questionLabelDeleteQuery,
}

const questionInsert = "questionInsert"
const questionInsertQuery = `INSERT INTO
	questions(
		id, question, duration_limit
	) values(
		$1, $2, $3
	)
`
const questionLabelInsert = "questionLabelInsert"
const questionLabelInsertQuery = `INSERT INTO
	questions_labels(
		id, question_id, competency_id
	) SELECT
	UNNEST($1::UUID[]), $2, UNNEST($3::UUID[])
`

func (r *questionRepository) Insert(ctx context.Context, question *repository.Question, labels *repository.Labels) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[questionInsert]).ExecContext(ctx,
		question.ID, question.Question, question.DurationLimit,
	)
	if err != nil {
		return err
	}

	_, err = tx.StmtContext(ctx, r.ps[questionLabelInsert]).ExecContext(ctx,
		labels.IDs, question.ID, labels.CompetencyIDs,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const questionSelectAll = "questionSelectAll"
const questionSelectAllQuery = `SELECT
	q.id, q.question, q.duration_limit, ql.id, ql.competency_id, ql.question_id
	FROM questions q
	LEFT JOIN questions_labels ql ON q.id = ql.question_id
	WHERE q.deleted = false AND ql.deleted = false
`

func (r *questionRepository) SelectAll(ctx context.Context) ([]*repository.Question, error) {
	rows, err := r.ps[questionSelectAll].QueryContext(ctx)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	questions := []*repository.Question{}
	for rows.Next() {
		question := &repository.Question{}
		questionLabel := &repository.QuestionLabel{}
		err := rows.Scan(
			&question.ID, &question.Question, &question.DurationLimit,
			&questionLabel.ID, &questionLabel.CompetencyID, &questionLabel.QuestionID,
		)
		if err != nil {
			return nil, err
		}

		lenQ := len(questions)
		if lenQ > 0 && questionLabel.QuestionID == questions[lenQ-1].ID {
			questions[lenQ-1].Labels = append(questions[lenQ-1].Labels, questionLabel)
		} else {
			if questionLabel.QuestionID != "" {
				question.Labels = append(question.Labels, questionLabel)
			}

			questions = append(questions, question)
		}
	}

	return questions, nil
}

const questionSelectAllByRoomID = "questionSelectAllByRoomID"
const questionSelectAllByRoomIDQuery = `SELECT
	q.id, q.question, q.duration_limit, ql.id, ql.competency_id, ql.question_id
	FROM questions q
	INNER JOIN rooms_has_questions rq ON q.id = rq.question_id
	LEFT JOIN questions_labels ql ON q.id = ql.question_id
	WHERE q.deleted = false AND rq.room_id = $1 AND ql.deleted = false
`

func (r *questionRepository) SelectAllByRoomID(ctx context.Context, id string) ([]*repository.Question, error) {
	rows, err := r.ps[questionSelectAllByRoomID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	questions := []*repository.Question{}
	for rows.Next() {
		question := &repository.Question{}
		questionLabel := &repository.QuestionLabel{}
		err := rows.Scan(
			&question.ID, &question.Question, &question.DurationLimit,
			&questionLabel.ID, &questionLabel.CompetencyID, &questionLabel.QuestionID,
		)
		if err != nil {
			return nil, err
		}

		lenQ := len(questions)
		if lenQ > 0 && questionLabel.QuestionID == questions[lenQ-1].ID {
			questions[lenQ-1].Labels = append(questions[lenQ-1].Labels, questionLabel)
		} else {
			if questionLabel.QuestionID != "" {
				question.Labels = append(question.Labels, questionLabel)
			}

			questions = append(questions, question)
		}
	}

	return questions, nil
}

const questionSelectOne = "questionSelectOne"
const questionSelectOneQuery = `SELECT
	q.id, q.question, q.duration_limit, ql.id, ql.competency_id, ql.question_id
	FROM questions q
	LEFT JOIN questions_labels ql ON q.id = ql.question_id
	WHERE q.deleted = false AND ql.deleted = false AND q.id = $1
`

func (r *questionRepository) SelectOneByID(ctx context.Context, id string) (*repository.Question, error) {
	rows, err := r.ps[questionSelectOne].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	question := &repository.Question{}
	for rows.Next() {
		questionLabel := &repository.QuestionLabel{}
		err := rows.Scan(
			&question.ID, &question.Question, &question.DurationLimit,
			&questionLabel.ID, &questionLabel.CompetencyID, &questionLabel.QuestionID,
		)
		if err != nil {
			return nil, err
		}

		if questionLabel.QuestionID != "" {
			question.Labels = append(question.Labels, questionLabel)
		}
	}

	return question, nil
}

const questionUpdate = "questionUpdate"
const questionUpdateQuery = `UPDATE questions SET
	question = $2,
	duration_limit = $3,
	updated_at = $4
	WHERE id = $1
`

const questionLabelUpsert = "questionLabelUpsert"
const questionLabelUpsertQuery = `INSERT INTO questions_labels(
		id, question_id, competency_id
	) SELECT
	UNNEST($1::UUID[]), $2, UNNEST($3::UUID[])
	ON CONFLICT (id)
	DO UPDATE SET
	updated_at = $4
`

const questionLabelDeleteNotInList = "questionLabelDeleteNotInList"
const questionLabelDeleteNotInListQuery = `UPDATE questions_labels SET
	deleted = true,
	deleted_at = $3
	WHERE question_id = $1 AND NOT id = ANY($2::UUID[])
`

func (r *questionRepository) Upsert(ctx context.Context, question *repository.Question, labels *repository.Labels) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	updatedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[questionUpdate]).ExecContext(ctx,
		question.ID, question.Question, question.DurationLimit, updatedAt,
	)
	if err != nil {
		return err
	}

	updatedRows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if updatedRows != 1 {
		return sql.ErrNoRows
	}

	res, err = tx.StmtContext(ctx, r.ps[questionLabelUpsert]).ExecContext(ctx,
		labels.IDs, question.ID, labels.CompetencyIDs, updatedAt,
	)
	if err != nil {
		return err
	}

	res, err = tx.StmtContext(ctx, r.ps[questionLabelDeleteNotInList]).ExecContext(ctx,
		question.ID, labels.IDs, updatedAt,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const questionDelete = "questionDelete"
const questionDeleteQuery = `UPDATE questions SET
	deleted = true,
	deleted_at = $2
	WHERE id = $1
`

const questionLabelDelete = "questionLabelDelete"
const questionLabelDeleteQuery = `UPDATE questions_labels SET
	deleted = true,
	deleted_at = $2
	WHERE question_id = $1
`

func (r *questionRepository) DeleteByID(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	deletedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[questionDelete]).ExecContext(ctx, id, deletedAt)
	if err != nil {
		return err
	}

	updatedRows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if updatedRows != 1 {
		return sql.ErrNoRows
	}

	res, err = tx.StmtContext(ctx, r.ps[questionLabelDelete]).ExecContext(ctx, id, deletedAt)
	if err != nil {
		return err
	}

	updatedRows, err = res.RowsAffected()
	if err != nil {
		return err
	}
	if updatedRows < 1 {
		return sql.ErrNoRows
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}
