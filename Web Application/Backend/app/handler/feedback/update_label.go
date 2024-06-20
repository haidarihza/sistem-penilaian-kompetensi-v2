package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"encoding/json"
	"database/sql"
	"github.com/go-chi/chi/v5"
)

type FeedbackUpdate struct {
	LabelFeedback string `json:"label_feedback"`
}

func UpdateFeedback(feedbackRepository repository.FeedbackRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := FeedbackUpdate{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		feedbackID := chi.URLParam(r, "id")
		status, ok := repository.FeedbackStatusMapper("REVIEWED")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		feedbackUpdate := &repository.Feedback{
			ID: feedbackID,
			Status: status,
			LabelFeedback: sql.NullString{
				String: req.LabelFeedback,
				Valid:  true,
			},
		}

		if err := feedbackRepository.UpdateFeedback(r.Context(), feedbackUpdate); err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Feedback not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}