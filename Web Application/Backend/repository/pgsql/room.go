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
	roomInsert:               		    	roomInsertQuery,
	roomInsertRoomGroup:          			roomInsertRoomGroupQuery,
	roomQuestionsInsert:          			roomQuestionsInsertQuery,
	roomCompetenciesInsert:       			roomCompetenciesInsertQuery,
	roomGroupSelectAllByInterviewerID:	roomGroupSelectAllByInterviewerIDQuery,
	roomGroupSelectAllByIntervieweeID:	roomGroupSelectAllByIntervieweeIDQuery,
	roomSelectAllByRoomGroupID:				  roomSelectAllByRoomGroupIDQuery,
	roomGroupSelectOneByID:				      roomGroupSelectOneByIDQuery,
	roomSelectOneByIDUserID:				    roomSelectOneByIDUserIDQuery,
	roomInsertTranscript:				        roomInsertTranscriptQuery,
	roomIsAnswered:				              roomIsAnsweredQuery,
	roomGetAnswers:				              roomGetAnswersQuery,
	roomInsertResult:				            roomInsertResultQuery,
	roomUpdateStatus:				            roomUpdateStatusQuery,
	roomGetResultCompetencies:				  roomGetResultCompetenciesQuery,
	roomGetResultQuestions:				      roomGetResultQuestionsQuery,
	roomReview:				                  roomReviewQuery,
	roomDeleteByID:											roomDeleteByIDQuery,
	roomGroupDeleteByID:								roomGroupDeleteByIDQuery,
	roomCompetenciesDelete:							roomCompetenciesDeleteQuery,
	roomQuestionsDelete:								roomQuestionsDeleteQuery,
	roomResultCompetenciesDelete:				roomResultCompetenciesDeleteQuery,
}

const roomInsert = "roomInsert"
const roomInsertQuery = `INSERT INTO
	rooms(
		id, title, description, "start", "end", status, language, interviewer_id, room_group_id
	) values(
		$1, $2, $3, $4, $5, $6, $7, $8, $9
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
		room.Status, room.Language, room.InterviewerID, room.RoomGroupID,
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

const roomInsertRoomGroup = "roomInsertRoomGroup"
const roomInsertRoomGroupQuery = `INSERT INTO
	room_groups(
		id, title, org_position, interviewee_id
	) values(
		$1, $2, $3, $4
	)
`

func (r *roomRepository) InsertRoomGroup(
	ctx context.Context,
	roomGroup *repository.RoomGroup) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[roomInsertRoomGroup]).ExecContext(ctx,
		roomGroup.ID, roomGroup.Title, roomGroup.OrgPosition, roomGroup.IntervieweeID,
	)

	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const roomGroupSelectAllByInterviewerID = "roomGroupSelectAllByInterviewerID"
const roomGroupSelectAllByInterviewerIDQuery = `WITH distinct_room_groups AS (
	SELECT DISTINCT room_group_id
	FROM rooms
	WHERE interviewer_id = $1 AND deleted = false
	)
	SELECT
		rg.id, rg.title, rg.org_position, u.email, u.name
	FROM distinct_room_groups drg
	INNER JOIN room_groups rg ON drg.room_group_id = rg.id
	INNER JOIN "users" u ON rg.interviewee_id = u.id
`

func (r *roomRepository) SelectAllRoomGroupByInterviewerID(ctx context.Context, id string) ([]*repository.RoomGroup, error) {
	rows, err := r.ps[roomGroupSelectAllByInterviewerID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roomGroups := []*repository.RoomGroup{}
	for rows.Next() {
		roomGroup := &repository.RoomGroup{}
		interviewee := &repository.User{}
		err := rows.Scan(&roomGroup.ID, &roomGroup.Title, &roomGroup.OrgPosition,
			&interviewee.Email, &interviewee.Name,
		)
		if err != nil {
			return nil, err
		}

		roomGroup.Interviewee = interviewee
		roomGroups = append(roomGroups, roomGroup)
	}

	return roomGroups, nil
}

const roomGroupSelectAllByIntervieweeID = "roomGroupSelectAllByIntervieweeID"
const roomGroupSelectAllByIntervieweeIDQuery = `SELECT
	rg.id, rg.title, rg.org_position, u.email, u.name
	FROM room_groups rg
	INNER JOIN "users" u ON rg.interviewee_id = u.id
	WHERE rg.interviewee_id = $1 AND rg.deleted = false
`

func (r *roomRepository) SelectAllRoomGroupByIntervieweeID(ctx context.Context, id string) ([]*repository.RoomGroup, error) {
	rows, err := r.ps[roomGroupSelectAllByIntervieweeID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	roomGroups := []*repository.RoomGroup{}
	for rows.Next() {
		roomGroup := &repository.RoomGroup{}
		interviewee := &repository.User{}
		err := rows.Scan(&roomGroup.ID, &roomGroup.Title, &roomGroup.OrgPosition,
			&interviewee.Email, &interviewee.Name,
		)
		if err != nil {
			return nil, err
		}

		roomGroup.Interviewee = interviewee
		roomGroups = append(roomGroups, roomGroup)
	}

	return roomGroups, nil
}

const roomSelectAllByRoomGroupID = "roomSelectAllByRoomGroupID"
const roomSelectAllByRoomGroupIDQuery = `SELECT
	r.id, r.title, r.description, r."start", r."end", r.submission, r.status, r.note, r.language, u.name
	FROM rooms r
	INNER JOIN users u ON r.interviewer_id = u.id
	WHERE r.room_group_id = $1 AND r.deleted = false
`

func (r *roomRepository) SelectAllRoomByGroupID(ctx context.Context, id string) ([]*repository.Room, error) {
	rows, err := r.ps[roomSelectAllByRoomGroupID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []*repository.Room{}
	for rows.Next() {
		room := &repository.Room{}
		interviewer := &repository.User{}
		err := rows.Scan(&room.ID, &room.Title, &room.Description,
			&room.Start, &room.End, &room.Submission, &room.Status, &room.Note, &room.Language,
			&interviewer.Name,
		)

		if err != nil {
			return nil, err
		}

		room.Interviewer = interviewer
		rooms = append(rooms, room)
	}

	return rooms, nil
}

const roomGroupSelectOneByID = "roomGroupSelectOneByID"
const roomGroupSelectOneByIDQuery = `SELECT
	rg.id, rg.title, rg.org_position, u.email, u.name, u.phone
	FROM room_groups rg
	INNER JOIN "users" u ON rg.interviewee_id = u.id
	WHERE rg.id = $1 AND rg.deleted = false
`

func (r *roomRepository) SelectRoomGroupByID(ctx context.Context, id string) (*repository.RoomGroup, error) {
	roomGroup := &repository.RoomGroup{
		Interviewee: &repository.User{},
	}

	row := r.ps[roomGroupSelectOneByID].QueryRowContext(ctx, id)
	err := row.Scan(&roomGroup.ID, &roomGroup.Title, &roomGroup.OrgPosition,
		&roomGroup.Interviewee.Email, &roomGroup.Interviewee.Name, &roomGroup.Interviewee.Phone,
	)
	if err != nil {
		return nil, err
	}

	return roomGroup, err
}

const roomSelectOneByIDUserID = "roomSelectOneByIDUserID"
const roomSelectOneByIDUserIDQuery = `SELECT 
	r.id, r.title, r.description, r."start", r."end", r.submission, r.status, r.note, r.language, r.room_group_id,
	u.name, u.email
	FROM rooms r
	INNER JOIN "users" u ON r.interviewer_id = u.id
	WHERE r.id = $1 AND r.deleted = false
`

func (r *roomRepository) SelectOneRoomByID(ctx context.Context, id string) (*repository.Room, error) {
	room := &repository.Room{
		Interviewer: &repository.User{},
	}

	row := r.ps[roomSelectOneByIDUserID].QueryRowContext(ctx, id)
	err := row.Scan(&room.ID, &room.Title, &room.Description,
		&room.Start, &room.End, &room.Submission, &room.Status, &room.Note, &room.Language, &room.RoomGroupID,
		&room.Interviewer.Name, &room.Interviewer.Email,
	)
	if err != nil {
		return nil, err
	}

	return room, err
}

const roomInsertTranscript = "roomInsertTranscript"
const roomInsertTranscriptQuery = `UPDATE rooms_has_questions SET
	file_link = $3,
	transcript = $4
	WHERE
	room_id = $1 AND question_id = $2
`

func (r *roomRepository) InsertTranscript(ctx context.Context, roomId, questionId, link string, transcript string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[roomInsertTranscript]).ExecContext(ctx,
		roomId, questionId, link, transcript,
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

func (r *roomRepository) UpdateStatusAndSubmission(ctx context.Context, room *repository.Room) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	submission := time.Now().UTC()
	_, err = tx.StmtContext(ctx, r.ps[roomUpdateStatus]).ExecContext(ctx,
		room.ID, room.Status, submission,
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
		var transcript sql.NullString
		err := rows.Scan(&questionId, &transcript)
		if err != nil {
			fmt.Println("error scan", err)
			return nil, err
		}

		// Check if transcript is valid or not
		if transcript.Valid {
			results[questionId] = transcript.String
		} else {
			results[questionId] = ""
		}
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

const roomGroupDeleteByID = "roomGroupDeleteByID"
const roomGroupDeleteByIDQuery = `UPDATE room_groups SET
	deleted = true,
	deleted_at = $2
	WHERE id = $1
`

func (r *roomRepository) DeleteByID(ctx context.Context, roomId string, roomGroupId string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.StmtContext(ctx, r.ps[roomDeleteByID]).ExecContext(ctx, roomId, time.Now().UTC())
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomQuestionsDelete]).ExecContext(ctx, roomId)
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomCompetenciesDelete]).ExecContext(ctx, roomId)
	if err != nil {
		return err
	}
	_, err = tx.StmtContext(ctx, r.ps[roomResultCompetenciesDelete]).ExecContext(ctx, roomId)
	if err != nil {
		return err
	}
	//check if room group has no more rooms
	rows, err := tx.StmtContext(ctx, r.ps[roomSelectAllByRoomGroupID]).QueryContext(ctx, roomGroupId)
	if err != nil {
		return err
	}

	var count int

	for rows.Next() {
		count++
	}

	if count == 0 {
		_, err = tx.StmtContext(ctx, r.ps[roomGroupDeleteByID]).ExecContext(ctx, roomGroupId, time.Now().UTC())
		if err != nil {
			return err
		}
	}

	if err = tx.Commit(); err != nil {
		return err
	}
	return nil
}

