package handler

import "interview/summarization/repository"

type CtxKey string

const UserContextKey = CtxKey("user_ctx")

type UserCtx struct {
	ID   string
	Role repository.UserRole
}
