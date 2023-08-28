package middleware

import (
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

func RBAC(roles ...repository.UserRole) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			usrCtx, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
			if !ok {
				response.RespondError(w, response.UnauthorizedError("Unauthorized"))
				return
			}

			for _, role := range roles {
				if role == usrCtx.Role {
					next.ServeHTTP(w, r)
					return
				}
			}

			response.RespondError(w, response.UnauthorizedError("Unauthorized"))
			return
		})
	}
}
