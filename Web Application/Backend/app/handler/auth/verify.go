package auth

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"interview/summarization/token"
	"net/http"
)

type VerifyResponse struct {
	Message string `json:"message"`
}

func Verify(userRepository repository.UserRepository, jwt token.JWT) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.FormValue("token")

		_, err := jwt.GetClaims(token)
		if err != nil {
			response.RespondError(w, response.BadRequestError("Invalid Token"))
			return
		}

		response.Respond(w, http.StatusOK, VerifyResponse{
			Message: "User Verified",
		})
	}
}
