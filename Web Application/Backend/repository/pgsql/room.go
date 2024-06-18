package pgsql

import (
	"context"
	"database/sql"
	"fmt"
	"interview/summarization/repository"
	"time"
)

type roomRepository struct {
	db *sql.DB
	ps map[string]*sql.Stmt
}

func NewRoomRepository(db *sql.DB) (repository.RoomRepository, error) {
	ps := make(map[string]*sql.Stmt, len(roomQueries))
	for key, query := range roomQueries {
		stmt, err := prepareStmt(db, "roomRepository", key, query)
		if err != nil {
			return nil, fmt.Errorf("Room Repository: %w", err)
		}

		ps[key] = stmt
	}

	return &roomRepository{db, ps}, nil
}

var roomQueries = map[string]string{
	roomInsert:                   roomInsertQuery,
	roomQuestionsInsert:          roomQuestionsInsertQuery,
	roomCompetenciesInsert:       roomCompetenciesInsertQuery,
	roomSelectAllByInterviewerID: roomSelectAllByInterviewerIDQuery,
	roomSelectAllByIntervieweeID: roomSelectAllByIntervieweeIDQuery,
	roomSelectOneByIDUserID:      roomSelectOneByIDUserIDQuery,
	roomInsertTranscript:         roomInsertTranscriptQuery,
	roomIsAnswered:               roomIsAnsweredQuery,
	roomGetAnswers:               roomGetAnswersQuery,
	roomInsertResult:             roomInsertResultQuery,
	roomUpdateStatus:             roomUpdateStatusQuery,
	roomGetResultCompetencies:    roomGetResultCompetenciesQuery,
	roomGetResultQuestions:       roomGetResultQuestionsQuery,
	roomReview:                   roomReviewQuery,
	roomDeleteByID:								roomDeleteByIDQuery,
	roomCompetenciesDelete:				roomCompetenciesDeleteQuery,
	roomQuestionsDelete:					roomQuestionsDeleteQuery,
	roomResultCompetenciesDelete:	roomResultCompetenciesDeleteQuery,
}

const roomInsert = "roomInsert"
const roomInsertQuery = `INSERT INTO
	rooms(
		id, title, description, "start", "end", status, interviewer_id, interviewee_id
	) values(
		$1, $2, $3, $4, $5, $6, $7, $8
	)
	RETURNING id
`

const roomQuestionsInsert = "roomQuestionsInsert"
const roomQuestionsInsertQuery = `INSERT INTO
	rooms_has_questions(
		room_id, question_id
	) SELECT
		$1, UNNEST($2::UUID[])
`

const roomCompetenciesInsert = "roomCompetenciesInsert"
const roomCompetenciesInsertQuery = `INSERT INTO
	rooms_has_competencies(
		room_id, competency_id
	) SELECT
		$1, UNNEST($2::UUID[])
`

func (r *roomRepository) Insert(
	ctx context.Context,
	room *repository.Room,
	questions, competencies []string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var id string
	row := tx.StmtContext(ctx, r.ps[roomInsert]).QueryRowContext(ctx,
		room.ID, room.Title, room.Description, room.Start, room.End,
		room.Status, room.InterviewerID, room.IntervieweeID,
	)
	err = row.Scan(&id)
	if err != nil {
		return err
	}

	_, err = tx.StmtContext(ctx, r.ps[roomQuestionsInsert]).ExecContext(ctx,
		room.ID, questions,
	)
	if err != nil {
		return err
	}

	_, err = tx.StmtContext(ctx, r.ps[roomCompetenciesInsert]).ExecContext(ctx,
		room.ID, competencies,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const roomSelectAllByInterviewerID = "roomSelectAllByInterviewerID"
const roomSelectAllByInterviewerIDQuery = `SELECT
	r.id, r.title, u.name, u.email, r."start", r."end", r.submission, r.status
	FROM rooms r
	INNER JOIN "users" u ON r.interviewee_id = u.id
	WHERE r.interviewer_id = $1 AND r.deleted = false
`

func (r *roomRepository) SelectAllByInterviewerID(ctx context.Context, id string) ([]*repository.Room, error) {
	rows, err := r.ps[roomSelectAllByInterviewerID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []*repository.Room{}
	for rows.Next() {
		room := &repository.Room{}
		interviewee := &repository.User{}
		err := rows.Scan(&room.ID, &room.Title,
			&interviewee.Name, &interviewee.Email, &room.Start, &room.End,
			&room.Submission, &room.Status)
		if err != nil {
			return nil, err
		}

		room.Interviewee = interviewee
		rooms = append(rooms, room)
	}

	return rooms, nil
}

const roomSelectAllByIntervieweeID = "roomSelectAllByIntervieweeID"
const roomSelectAllByIntervieweeIDQuery = `SELECT
	id, title, "start", "end", status
	FROM rooms 
	WHERE interviewee_id = $1 AND deleted = false
`

func (r *roomRepository) SelectAllByIntervieweeID(ctx context.Context, id string) ([]*repository.Room, error) {
	rows, err := r.ps[roomSelectAllByIntervieweeID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []*repository.Room{}
	for rows.Next() {
		room := &repository.Room{}
		err := rows.Scan(&room.ID, &room.Title,
			&room.Start, &room.End, &room.Status)
		if err != nil {
			return nil, err
		}

		rooms = append(rooms, room)
	}

	return rooms, nil
}

const roomSelectOneByIDUserID = "roomSelectOneByIDUserID"
const roomSelectOneByIDUserIDQuery = `SELECT 
	r.id, r.title, r.description, r."start", r."end", r.submission, r.status, r.note,
	u.email, u.name, u.phone
	FROM rooms r
	INNER JOIN "users" u ON r.interviewee_id = u.id
	WHERE r.id = $1 AND (r.interviewer_id = $2 OR r.interviewee_id = $3)
	AND r.deleted = false
`

func (r *roomRepository) SelectOneByIDUserID(ctx context.Context, id, userID string) (*repository.Room, error) {
	room := &repository.Room{
		Interviewee: &repository.User{},
	}

	row := r.ps[roomSelectOneByIDUserID].QueryRowContext(ctx, id, userID, userID)
	err := row.Scan(&room.ID, &room.Title, &room.Description,
		&room.Start, &room.End, &room.Submission, &room.Status, &room.Note,
		&room.Interviewee.Email, &room.Interviewee.Name, &room.Interviewee.Phone,
	)
	if err != nil {
		return nil, err
	}

	return room, err
}

const roomInsertTranscript = "roomInsertTranscript"
const roomInsertTranscriptQuery = `UPDATE rooms_has_questions
	SET transcript = $3
	WHERE
	room_id = $1 AND question_id = $2
`

func (r *roomRepository) InsertTranscript(ctx context.Context, roomId, questionId, transcript string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[roomInsertTranscript]).ExecContext(ctx,
		roomId, questionId, transcript,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const roomIsAnswered = "roomIsAnswered"
const roomIsAnsweredQuery = `SELECT 
	CASE WHEN transcript IS NULL THEN false ELSE true END AS is_answered
	FROM rooms_has_questions
	WHERE room_id = $1
`

func (r *roomRepository) IsAnswered(ctx context.Context, roomId string) (bool, error) {
	rows, err := r.ps[roomIsAnswered].QueryContext(ctx, roomId)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	var isAnswered bool
	for rows.Next() {
		err := rows.Scan(&isAnswered)
		if err != nil {
			return false, err
		}

		if !isAnswered {
			return isAnswered, nil
		}
	}

	return isAnswered, nil
}

const roomGetAnswers = "roomGetAnswers"
const roomGetAnswersQuery = `SELECT
	transcript
	FROM rooms_has_questions
	WHERE room_id = $1
`

func (r *roomRepository) GetAnswers(ctx context.Context, roomId string) (string, error) {
	rows, err := r.ps[roomGetAnswers].QueryContext(ctx, roomId)
	if err != nil {
		return "", err
	}
	defer rows.Close()

	var answers string
	for rows.Next() {
		var answer string

		err := rows.Scan(&answer)
		if err != nil {
			return "", err
		}

		if answers == "" {
			answers = answer
		} else {
			answers = fmt.Sprintf("%s. %s", answers, answer)
		}
	}

	return answers, nil
}

const roomInsertResult = "roomInsertResult"
const roomInsertResultQuery = `INSERT INTO
	results_competencies(
		room_id, competency, level, result
	) SELECT
	$1, UNNEST($2::TEXT[]), UNNEST($3::TEXT[]), UNNEST($4::REAL[])
`

const roomUpdateStatus = "roomUpdateStatus"
const roomUpdateStatusQuery = `UPDATE rooms
	SET status = $2,
	submission = $3
	WHERE id = $1
`

func (r *roomRepository) InsertResult(ctx context.Context, roomId string, competency, level []string, result []float64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	submitAt := time.Now().UTC()
	_, err = tx.StmtContext(ctx, r.ps[roomUpdateStatus]).ExecContext(ctx,
		roomId, "Menunggu Review", submitAt,
	)
	if err != nil {
		return err
	}

	_, err = tx.StmtContext(ctx, r.ps[roomInsertResult]).ExecContext(ctx,
		roomId, competency, level, result,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const roomGetResultCompetencies = "roomGetResultCompetencies"
const roomGetResultCompetenciesQuery = `SELECT
	competency, level, result
	FROM results_competencies
	WHERE room_id = $1
`

func (r *roomRepository) GetResultCompetencies(ctx context.Context, roomId string) (repository.ResultCompetency, error) {
	rows, err := r.ps[roomGetResultCompetencies].QueryContext(ctx, roomId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := repository.ResultCompetency{}
	for rows.Next() {
		var competency string
		var level string
		var val float64
		err := rows.Scan(&competency, &level, &val)
		if err != nil {
			return nil, err
		}

		if _, ok := results[competency]; !ok {
			results[competency] = map[string]float64{
				level: val,
			}
		} else {
			results[competency][level] = val
		}
	}

	return results, nil
}

const roomGetResultQuestions = "roomGetResultQuestions"
const roomGetResultQuestionsQuery = `SELECT
	question_id, transcript
	FROM rooms_has_questions
	WHERE room_id = $1
`

func (r *roomRepository) GetResultQuestions(ctx context.Context, roomId string) (repository.ResultQuestion, error) {
	rows, err := r.ps[roomGetResultQuestions].QueryContext(ctx, roomId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := repository.ResultQuestion{}
	for rows.Next() {
		var questionId string
		var transcript string
		err := rows.Scan(&questionId, &transcript)
		if err != nil {
			return nil, err
		}

		results[questionId] = transcript
	}

	return results, nil
}

const roomReview = "roomReview"
const roomReviewQuery = `UPDATE rooms SET
	status = $2,
	note = $3
	WHERE id = $1
`

func (r *roomRepository) Review(ctx context.Context, room *repository.Room) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.StmtContext(ctx, r.ps[roomReview]).ExecContext(ctx,
		room.ID, room.Status, room.Note.String,
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

const roomQuestionsDelete = "roomQuestionsDelete"
const roomQuestionsDeleteQuery = `DELETE FROM ONLY rooms_has_questions
	WHERE room_id = $1
`

const roomCompetenciesDelete = "roomComptenciesDelete"
const roomCompetenciesDeleteQuery = `DELETE FROM ONLY rooms_has_competencies
	WHERE room_id = $1
`

const roomResultCompetenciesDelete = "roomResultCompetenciesDelete"
const roomResultCompetenciesDeleteQuery = `DELETE FROM ONLY results_competencies
	WHERE room_id = $1
`

const roomDeleteByID = "roomDeleteByID"
const roomDeleteByIDQuery = `UPDATE rooms SET
	deleted = true,
	deleted_at = $2
	WHERE id = $1
`

func (r *roomRepository) DeleteByID(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.StmtContext(ctx, r.ps[roomDeleteByID]).ExecContext(ctx, id, time.Now().UTC())
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomQuestionsDelete]).ExecContext(ctx, id)
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomCompetenciesDelete]).ExecContext(ctx, id)
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomResultCompetenciesDelete]).ExecContext(ctx, id)
	if err != nil {
		return err
	}
	if err = tx.Commit(); err != nil {
		return err
	}
	return nil
}

