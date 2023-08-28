package pgsql

import (
	"context"
	"database/sql"
	"fmt"
	"interview/summarization/repository"
	"time"
)

type competencyRepository struct {
	db *sql.DB
	ps map[string]*sql.Stmt
}

func NewCompetencyRepository(db *sql.DB) (repository.CompetencyRepository, error) {
	ps := make(map[string]*sql.Stmt, len(competencyQueries))
	for key, query := range competencyQueries {
		stmt, err := prepareStmt(db, "competencyRepository", key, query)
		if err != nil {
			return nil, fmt.Errorf("Competency Repository: %w", err)
		}

		ps[key] = stmt
	}

	return &competencyRepository{db, ps}, nil
}

var competencyQueries = map[string]string{
	competencyInsert:               competencyInsertQuery,
	competencyLevelInsert:          competencyLevelInsertQuery,
	competencySelectAll:            competencySelectAllQuery,
	competencySelectAllByRoomID:    competencySelectAllByRoomIDQuery,
	competencySelectOne:            competencySelectOneQuery,
	competencyUpdate:               competencyUpdateQuery,
	competencyLevelUpsert:          competencyLevelUpsertQuery,
	competencyLevelDeleteNotInList: competencyLevelDeleteNotInListQuery,
	competencyDelete:               competencyDeleteQuery,
	competencyLevelDelete:          competencyLevelDeleteQuery,
}

const competencyInsert = "competencyInsert"
const competencyInsertQuery = `INSERT INTO
	competencies(
		id, competency
	) values(
		$1, $2
	)
`

const competencyLevelInsert = "competencyLevelInsert"
const competencyLevelInsertQuery = `INSERT INTO
	competency_levels(
		id, level, description, competency_id
	) SELECT
	UNNEST($1::UUID[]), UNNEST($2::TEXT[]), UNNEST($3::TEXT[]), $4
`

func (r *competencyRepository) Insert(ctx context.Context, competency *repository.Competency, levels *repository.Levels) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[competencyInsert]).ExecContext(ctx,
		competency.ID, competency.Competency,
	)
	if err != nil {
		return err
	}

	_, err = tx.StmtContext(ctx, r.ps[competencyLevelInsert]).ExecContext(ctx,
		levels.IDs, levels.Levels, levels.Descriptions, competency.ID,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const competencySelectAll = "competencySelectAll"
const competencySelectAllQuery = `SELECT
	c.id, c.competency, cl.id, cl.level, cl.description, cl.competency_id
	FROM competencies c
	LEFT JOIN competency_levels cl ON c.id = cl.competency_id
	WHERE c.deleted = false AND cl.deleted = false
`

func (r *competencyRepository) SelectAll(ctx context.Context) ([]*repository.Competency, error) {
	rows, err := r.ps[competencySelectAll].QueryContext(ctx)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	competencies := []*repository.Competency{}
	for rows.Next() {
		competency := &repository.Competency{}
		competencyLevel := &repository.CompetencyLevel{}
		err := rows.Scan(&competency.ID, &competency.Competency,
			&competencyLevel.ID, &competencyLevel.Level,
			&competencyLevel.Description, &competencyLevel.CompetencyID)
		if err != nil {
			return nil, err
		}

		lenCp := len(competencies)
		if lenCp > 0 && competencyLevel.CompetencyID == competencies[lenCp-1].ID {
			competencies[lenCp-1].Levels = append(competencies[lenCp-1].Levels, competencyLevel)
		} else {
			if competencyLevel.CompetencyID != "" {
				competency.Levels = append(competency.Levels, competencyLevel)
			}

			competencies = append(competencies, competency)
		}
	}

	return competencies, nil
}

const competencySelectAllByRoomID = "competencySelectAllByRoomID"
const competencySelectAllByRoomIDQuery = `SELECT
	c.id, c.competency, cl.id, cl.level, cl.description, cl.competency_id
	FROM competencies c
	INNER JOIN rooms_has_competencies rc ON c.id = rc.competency_id
	LEFT JOIN competency_levels cl ON c.id = cl.competency_id
	WHERE c.deleted = false AND rc.room_id = $1 AND cl.deleted = false
`

func (r *competencyRepository) SelectAllByRoomID(ctx context.Context, id string) ([]*repository.Competency, error) {
	rows, err := r.ps[competencySelectAllByRoomID].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	competencies := []*repository.Competency{}
	for rows.Next() {
		competency := &repository.Competency{}
		competencyLevel := &repository.CompetencyLevel{}
		err := rows.Scan(&competency.ID, &competency.Competency,
			&competencyLevel.ID, &competencyLevel.Level,
			&competencyLevel.Description, &competencyLevel.CompetencyID)
		if err != nil {
			return nil, err
		}

		lenCp := len(competencies)
		if lenCp > 0 && competencyLevel.CompetencyID == competencies[lenCp-1].ID {
			competencies[lenCp-1].Levels = append(competencies[lenCp-1].Levels, competencyLevel)
		} else {
			if competencyLevel.CompetencyID != "" {
				competency.Levels = append(competency.Levels, competencyLevel)
			}

			competencies = append(competencies, competency)
		}
	}

	return competencies, nil
}

const competencySelectOne = "competencySelectOne"
const competencySelectOneQuery = `SELECT
	c.id, c.competency, cl.id, cl.level, cl.description, cl.competency_id
	FROM competencies c
	LEFT JOIN competency_levels cl ON c.id = cl.competency_id
	WHERE c.deleted = false AND cl.deleted = false AND c.id = $1
`

func (r *competencyRepository) SelectOneByID(ctx context.Context, id string) (*repository.Competency, error) {
	rows, err := r.ps[competencySelectOne].QueryContext(ctx, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	competency := &repository.Competency{}
	for rows.Next() {
		competencyLevel := &repository.CompetencyLevel{}
		err := rows.Scan(&competency.ID, &competency.Competency,
			&competencyLevel.ID, &competencyLevel.Level,
			&competencyLevel.Description, &competencyLevel.CompetencyID)
		if err != nil {
			return nil, err
		}

		if competencyLevel.CompetencyID != "" {
			competency.Levels = append(competency.Levels, competencyLevel)
		}
	}

	return competency, nil
}

const competencyUpdate = "competencyUpdate"
const competencyUpdateQuery = `UPDATE competencies SET
	competency = $2,
	updated_at = $3
	WHERE id = $1
`

const competencyLevelUpsert = "competencyLevelUpsert"
const competencyLevelUpsertQuery = `INSERT INTO competency_levels(
		id, level, description, competency_id
	) SELECT
	UNNEST($1::UUID[]), UNNEST($2::TEXT[]), UNNEST($3::TEXT[]), $4
	ON CONFLICT (id)
	DO UPDATE SET
	level = excluded.level,
	description = excluded.description,
	updated_at = $5
`

const competencyLevelDeleteNotInList = "competencyLevelDeleteNotInList"
const competencyLevelDeleteNotInListQuery = `UPDATE competency_levels SET
	deleted = true,
	deleted_at = $3
	WHERE competency_id = $1 AND NOT id = ANY($2::UUID[])
`

func (r *competencyRepository) Upsert(ctx context.Context, competency *repository.Competency, levels *repository.Levels) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	currentAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[competencyUpdate]).ExecContext(ctx,
		competency.ID, competency.Competency, currentAt,
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

	res, err = tx.StmtContext(ctx, r.ps[competencyLevelUpsert]).ExecContext(ctx,
		levels.IDs, levels.Levels, levels.Descriptions, competency.ID, currentAt,
	)
	if err != nil {
		return err
	}

	res, err = tx.StmtContext(ctx, r.ps[competencyLevelDeleteNotInList]).ExecContext(ctx,
		competency.ID, levels.IDs, currentAt,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const competencyDelete = "competencyDelete"
const competencyDeleteQuery = `UPDATE competencies SET
	deleted = true,
	deleted_at = $2
	WHERE id = $1
`

const competencyLevelDelete = "competencyLevelDelete"
const competencyLevelDeleteQuery = `UPDATE competency_levels SET
	deleted = true,
	deleted_at = $2
	WHERE competency_id = $1
`

func (r *competencyRepository) DeleteByID(ctx context.Context, id string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	deletedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[competencyDelete]).ExecContext(ctx, id, deletedAt)
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

	res, err = tx.StmtContext(ctx, r.ps[competencyLevelDelete]).ExecContext(ctx, id, deletedAt)
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
