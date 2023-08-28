package auth

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func EmailCheck(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		email := chi.URLParam(r, "email")
		if _, err := userRepository.SelectIDByEmail(r.Context(), email); err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("User not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
