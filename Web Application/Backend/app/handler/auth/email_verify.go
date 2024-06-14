package auth

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"interview/summarization/token"
	"net/http"
)

type VerifyEmailResponse struct {
	Message string `json:"message"`
}

func VerifyEmail(userRepository repository.UserRepository, jwt token.JWT) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.FormValue("token")
		userID := r.FormValue("userID")
		res, err := jwt.GetClaims(token)
		if err != nil {
			response.RespondError(w, response.BadRequestError("Invalid Token"))
			return
		}

		if res.UserID != userID {
			response.RespondError(w, response.BadRequestError("Invalid Token"))
			return
		}

		status, ok := repository.UserStatusMapper("VERIFIED")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		updatedUser := &repository.User{
			ID:     userID,
			Status: status,
		}

		if err := userRepository.UpdateStatus(r.Context(), updatedUser); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.Respond(w, http.StatusOK, VerifyEmailResponse{
			Message: "Email Verified",
		})
	}
}
