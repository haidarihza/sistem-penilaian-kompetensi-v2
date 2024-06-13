package question

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"github.com/google/uuid"

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

		var updatedLabelsUid []string
		var updatedLabelsCompetencyUid []string
		for _, label := range req.Labels {
			if label.ID == "" {
				label.ID = uuid.NewString()
			}
			updatedLabelsUid = append(updatedLabelsUid, label.ID)
			updatedLabelsCompetencyUid = append(updatedLabelsCompetencyUid, label.CompetencyID)
		}
		updatedLabels := &repository.Labels{
			IDs:           updatedLabelsUid,
			CompetencyIDs: updatedLabelsCompetencyUid,
		}
		
		if err := questionRepository.Upsert(r.Context(), updatedQuestion, updatedLabels); err != nil {
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
