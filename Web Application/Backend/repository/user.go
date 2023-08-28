package repository

import (
	"context"
	"database/sql"
	"time"
)

type UserRole string

const (
	Interviewer = UserRole("INTERVIEWER")
	Interviewee = UserRole("INTERVIEWEE")
)

func UserRoleMapper(role string) (UserRole, bool) {
	mapper := map[string]UserRole{
		"INTERVIEWER": Interviewer,
		"INTERVIEWEE": Interviewee,
	}

	userRole, ok := mapper[role]
	return userRole, ok
}

type User struct {
	ID        string
	Name      string
	Phone     string
	Email     string
	Password  string
	Role      UserRole
	Status    string
	Deleted   bool
	CreatedAt time.Time
	UpdatedAt sql.NullTime
	DeletedAt sql.NullTime
}

type UserRepository interface {
	Insert(context.Context, *User) error
	SelectIDPasswordRoleByEmail(context.Context, string) (*User, error)
	SelectIDByEmail(context.Context, string) (*User, error)
	SelectNamePhoneEmailByID(context.Context, string) (*User, error)
	SelectPasswordByID(context.Context, string) (*User, error)
	Update(context.Context, *User) error
	UpdatePassword(context.Context, *User) error
}
