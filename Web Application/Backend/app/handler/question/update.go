package question

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Update(questionRepository repository.QuestionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Question{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		questionId := chi.URLParam(r, "id")

		updatedQuestion := &repository.Question{
			ID:            questionId,
			Question:      req.Question,
			DurationLimit: req.DurationLimit,
		}
		if err := questionRepository.Update(r.Context(), updatedQuestion); err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Question not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
