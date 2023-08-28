package auth

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func UpdatePassword(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		req := UpdatePasswordRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		user, err := userRepository.SelectPasswordByID(r.Context(), userCred.ID)
		if err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("User not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
			response.RespondError(w, response.UnauthorizedError("Invalid credentials"))
			return
		}

		hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		updatedUser := &repository.User{
			ID:       userCred.ID,
			Password: string(hashedPass),
		}
		if err := userRepository.UpdatePassword(r.Context(), updatedUser); err != nil {
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
