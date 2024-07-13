package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"encoding/json"
	"database/sql"
	"github.com/go-chi/chi/v5"
	"context"
	"fmt"
)

type FeedbackUpdate struct {
	Transkrip 		string `json:"transcript"`
	LabelFeedback string `json:"label_feedback"`
}

func UpdateFeedback(feedbackRepository repository.FeedbackRepository, summarizationHost string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := FeedbackUpdate{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		feedbackID := chi.URLParam(r, "id")
		status, ok := repository.FeedbackStatusMapper("LABELED")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		feedbackUpdate := &repository.Feedback{
			ID: feedbackID,
			Status: status,
			Transcript: req.Transkrip,
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

		go func(ctx context.Context, fRepo repository.FeedbackRepository) {
			isNoDataToLabel, _ := fRepo.IsNoDataToLabel(ctx)

			if isNoDataToLabel {
				fmt.Println("Train data")
				url := summarizationHost + "/train"
				resp,_ := http.Post(url, "application/json", nil)
				if resp.StatusCode != http.StatusOK {
					return
				}
				defer resp.Body.Close()
			}
		}(context.Background(), feedbackRepository)
		response.RespondOK(w)
	}
}