package auth

import (
	"database/sql"
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type ProfileResponse struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

func Profile(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		user, err := userRepository.SelectNamePhoneEmailByID(r.Context(), userCred.ID)
		if err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("User not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.Respond(w, http.StatusOK, ProfileResponse{
			Name:  user.Name,
			Phone: user.Phone,
			Email: user.Email,
		})
	}
}
