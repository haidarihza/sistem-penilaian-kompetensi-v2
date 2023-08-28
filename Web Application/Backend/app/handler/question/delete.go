package question

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Delete(questionRepository repository.QuestionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		questionId := chi.URLParam(r, "id")
		if err := questionRepository.DeleteByID(r.Context(), questionId); err != nil {
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
