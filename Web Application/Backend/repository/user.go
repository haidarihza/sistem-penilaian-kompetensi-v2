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

type UserStatus string

const (
	Veryfied = UserStatus("VERIFIED")
	Unverified = UserStatus("UNVERIFIED")
)

func UserStatusMapper(status string) (UserStatus, bool) {
	mapper := map[string]UserStatus{
		"VERIFIED": Veryfied,
		"UNVERIFIED": Unverified,
	}

	userStatus, ok := mapper[status]
	return userStatus, ok
}

type User struct {
	ID        string
	Name      string
	Phone     string
	Email     string
	Password  string
	Role      UserRole
	Status    UserStatus
	Deleted   bool
	CreatedAt time.Time
	UpdatedAt sql.NullTime
	DeletedAt sql.NullTime
}

type UserRepository interface {
	Insert(context.Context, *User) error
	SelectAll(context.Context) ([]*User, error)
	SelectIDPasswordRoleByEmail(context.Context, string) (*User, error)
	SelectIDByEmail(context.Context, string) (*User, error)
	SelectNamePhoneEmailByID(context.Context, string) (*User, error)
	SelectPasswordByID(context.Context, string) (*User, error)
	Update(context.Context, *User) error
	UpdatePassword(context.Context, *User) error
	UpdateStatus(context.Context, *User) error
}
