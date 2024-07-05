package auth

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type EmailResponse struct {
	Name 	string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

type AllEmailResponse struct {
	Data []EmailResponse `json:"data"`
}

func GetAllEmails(userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		resp := AllEmailResponse{
			Data: []EmailResponse{},
		}

		users, err := userRepository.SelectAll(r.Context())
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		for _, user := range users {
			resp.Data = append(resp.Data, EmailResponse{
				Name:  user.Name,
				Email: user.Email,
				Role: string(user.Role),
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
