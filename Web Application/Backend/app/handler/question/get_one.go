package question

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GetOneQuestionResponse struct {
	Data Question `json:"data"`
}

func GetOne(questionRepository repository.QuestionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		questionId := chi.URLParam(r, "id")
		question, err := questionRepository.SelectOneByID(r.Context(), questionId)
		if err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Question not found"))
				return
			}
		
			response.RespondError(w, response.InternalServerError())
			return
		}

		labels := make([]QuestionLabel, 0)
		for _, label := range question.Labels {
			labels = append(labels, QuestionLabel{
				ID:           label.ID,
				CompetencyID: label.CompetencyID,
			})
		}

		response.Respond(w, http.StatusOK, GetOneQuestionResponse{
			Data: Question{
				ID:            question.ID,
				Question:      question.Question,
				DurationLimit: question.DurationLimit,
				OrgPosition:   question.OrgPosition,
				Labels:        labels,
			},
		})
	}
}
