package middleware

import (
	"context"
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"interview/summarization/token"
	"net/http"
	"strings"
)

func Auth(jwt token.JWT) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := strings.Split(r.Header.Get("Authorization"), "Bearer ")
			if len(authHeader) != 2 {
				response.RespondError(w, response.UnauthorizedError("Unauthorized"))
				return
			}

			claim, err := jwt.GetClaims(authHeader[1])
			if err != nil {
				response.RespondError(w, response.UnauthorizedError("Unauthorized"))
				return
			}

			ctx := context.WithValue(r.Context(), handler.UserContextKey, handler.UserCtx{
				ID:   claim.UserID,
				Role: repository.UserRole(claim.Role),
			})
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		})
	}
}
