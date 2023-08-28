package question

import (
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/google/uuid"
)

type Question struct {
	ID            string `json:"id,omitempty"`
	Question      string `json:"question,omitempty"`
	DurationLimit int    `json:"duration_limit,omitempty"`
	Transcript    string `json:"transcript,omitempty"`
}

func Create(questionRepository repository.QuestionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Question{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		newQuestion := &repository.Question{
			ID:            uuid.NewString(),
			Question:      req.Question,
			DurationLimit: req.DurationLimit,
		}
		if err := questionRepository.Insert(r.Context(), newQuestion); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
