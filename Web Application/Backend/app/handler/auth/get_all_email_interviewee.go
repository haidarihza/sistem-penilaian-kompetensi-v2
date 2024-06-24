package auth

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type AllEmailResponse struct {
	Data []string `json:"data"`
}

func GetAllEmailInterviewee(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp := AllEmailResponse{
			Data: []string{},
		}
		users, err := userRepository.SelectAll(r.Context())
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		for _, user := range users {
			if user.Role == "INTERVIEWEE" {
				resp.Data = append(resp.Data, user.Email)
			}
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
