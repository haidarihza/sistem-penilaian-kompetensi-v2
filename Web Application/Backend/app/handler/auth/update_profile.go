package auth

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

func UpdateProfile(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		req := UpdateProfileRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		updatedUser := &repository.User{
			ID:    userCred.ID,
			Name:  req.Name,
			Phone: req.Phone,
		}
		if err := userRepository.Update(r.Context(), updatedUser); err != nil {
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
