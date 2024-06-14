package pgsql

import (
	"context"
	"database/sql"
	"fmt"
	"interview/summarization/repository"
	"time"
)

type userRepository struct {
	db *sql.DB
	ps map[string]*sql.Stmt
}

func NewUserRepository(db *sql.DB) (repository.UserRepository, error) {
	ps := make(map[string]*sql.Stmt, len(userQueries))
	for key, query := range userQueries {
		stmt, err := prepareStmt(db, "userRepository", key, query)
		if err != nil {
			return nil, fmt.Errorf("User Repository: %w", err)
		}

		ps[key] = stmt
	}

	return &userRepository{db, ps}, nil
}

var userQueries = map[string]string{
	userInsert:                      userInsertQuery,
	userSelectIDPasswordRoleByEmail: userSelectIDPasswordRoleByEmailQuery,
	userSelectIDByEmail:             userSelectIDByEmailQuery,
	userSelectNamePhoneEmailByID:    userSelectNamePhoneEmailByIDQuery,
	userSelectPasswordByID:          userSelectPasswordByIDQuery,
	userUpdate:                      userUpdateQuery,
	userUpdatePassword:              userUpdatePasswordQuery,
	userUpdateStatus:                userUpdateStatusQuery,
}

const userInsert = "userInsert"
const userInsertQuery = `INSERT INTO
	"users"(
		id, name, phone, email, password, role, status
	) values(
		$1, $2, $3, $4, $5, $6, $7
	)
`

func (r *userRepository) Insert(ctx context.Context, user *repository.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.StmtContext(ctx, r.ps[userInsert]).ExecContext(ctx,
		user.ID, user.Name, user.Phone, user.Email, user.Password, user.Role, user.Status,
	)
	if err != nil {
		return err
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	return nil
}

const userSelectIDPasswordRoleByEmail = "userSelectIDPasswordRoleByEmail"
const userSelectIDPasswordRoleByEmailQuery = `SELECT id, password, role, status
	FROM "users" WHERE email = $1
`

func (r *userRepository) SelectIDPasswordRoleByEmail(ctx context.Context, email string) (*repository.User, error) {
	user := &repository.User{}

	row := r.ps[userSelectIDPasswordRoleByEmail].QueryRowContext(ctx, email)
	err := row.Scan(
		&user.ID, &user.Password, &user.Role, &user.Status,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

const userSelectIDByEmail = "userSelectIDByEmail"
const userSelectIDByEmailQuery = `SELECT id
	FROM "users" WHERE email = $1
`

func (r *userRepository) SelectIDByEmail(ctx context.Context, email string) (*repository.User, error) {
	user := &repository.User{}

	row := r.ps[userSelectIDByEmail].QueryRowContext(ctx, email)
	err := row.Scan(
		&user.ID,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

const userSelectNamePhoneEmailByID = "userSelectNamePhoneEmailByID"
const userSelectNamePhoneEmailByIDQuery = `SELECT name, phone, email
	FROM "users" WHERE id = $1
`

func (r *userRepository) SelectNamePhoneEmailByID(ctx context.Context, id string) (*repository.User, error) {
	user := &repository.User{}

	row := r.ps[userSelectNamePhoneEmailByID].QueryRowContext(ctx, id)
	err := row.Scan(
		&user.Name, &user.Phone, &user.Email,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

const userSelectPasswordByID = "userSelectPasswordByID"
const userSelectPasswordByIDQuery = `SELECT password
	FROM "users" WHERE id = $1
`

func (r *userRepository) SelectPasswordByID(ctx context.Context, id string) (*repository.User, error) {
	user := &repository.User{}

	row := r.ps[userSelectPasswordByID].QueryRowContext(ctx, id)
	err := row.Scan(
		&user.Password,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

const userUpdate = "userUpdate"
const userUpdateQuery = `UPDATE "users" SET
	name = $2,
	phone = $3,
	updated_at = $4
	WHERE id = $1
`

func (r *userRepository) Update(ctx context.Context, user *repository.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	updatedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[userUpdate]).ExecContext(ctx,
		user.ID, user.Name, user.Phone, updatedAt,
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

const userUpdatePassword = "userUpdatePassword"
const userUpdatePasswordQuery = `UPDATE "users" SET
	password = $2,
	updated_at = $3
	WHERE id = $1
`

func (r *userRepository) UpdatePassword(ctx context.Context, user *repository.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	updatedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[userUpdatePassword]).ExecContext(ctx,
		user.ID, user.Password, updatedAt,
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

const userUpdateStatus = "userUpdateStatus"
const userUpdateStatusQuery = `UPDATE "users" SET
	status = $2,
	updated_at = $3
	WHERE id = $1
`

func (r *userRepository) UpdateStatus(ctx context.Context, user *repository.User) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	updatedAt := time.Now().UTC()
	res, err := tx.StmtContext(ctx, r.ps[userUpdateStatus]).ExecContext(ctx,
		user.ID, user.Status, updatedAt,
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
