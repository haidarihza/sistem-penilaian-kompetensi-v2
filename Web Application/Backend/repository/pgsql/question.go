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
	questionInsert:            questionInsertQuery,
	questionSelectAll:         questionSelectAllQuery,
	questionSelectAllByRoomID: questionSelectAllByRoomIDQuery,
	questionSelectOne:         questionSelectOneQuery,
	questionUpdate:            questionUpdateQuery,
	questionDelete:            questionDeleteQuery,
}

const questionInsert = "questionInsert"
const questionInsertQuery = `INSERT INTO
	questions(
		id, question, duration_limit
	) values(
		$1, $2, $3
	)
`

func (r *questionRepository) Insert(ctx context.Context, question *repository.Question) error {
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

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const questionSelectAll = "questionSelectAll"
const questionSelectAllQuery = `SELECT
	id, question, duration_limit
	FROM questions
	WHERE deleted = false
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
		err := rows.Scan(&question.ID, &question.Question, &question.DurationLimit)
		if err != nil {
			return nil, err
		}

		questions = append(questions, question)
	}

	return questions, nil
}

const questionSelectAllByRoomID = "questionSelectAllByRoomID"
const questionSelectAllByRoomIDQuery = `SELECT
	q.id, q.question, q.duration_limit
	FROM questions q
	INNER JOIN rooms_has_questions rq ON q.id = rq.question_id
	WHERE q.deleted = false AND rq.room_id = $1
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
		err := rows.Scan(&question.ID, &question.Question, &question.DurationLimit)
		if err != nil {
			return nil, err
		}

		questions = append(questions, question)
	}

	return questions, nil
}

const questionSelectOne = "questionSelectOne"
const questionSelectOneQuery = `SELECT
	id, question, duration_limit
	FROM questions
	WHERE deleted = false AND id = $1
`

func (r *questionRepository) SelectOneByID(ctx context.Context, id string) (*repository.Question, error) {
	question := &repository.Question{}

	row := r.ps[questionSelectOne].QueryRowContext(ctx, id)
	err := row.Scan(
		&question.ID, &question.Question, &question.DurationLimit,
	)
	if err != nil {
		return nil, err
	}

	return question, err
}

const questionUpdate = "questionUpdate"
const questionUpdateQuery = `UPDATE questions SET
	question = $2,
	duration_limit = $3,
	updated_at = $4
	WHERE id = $1
`

func (r *questionRepository) Update(ctx context.Context, question *repository.Question) error {
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

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}
