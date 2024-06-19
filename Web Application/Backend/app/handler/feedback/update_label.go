package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"encoding/json"
	"database/sql"
)

type FeedbackUpdate struct {
	ID string `json:"id"`
	LabelFeedback string `json:"label_feedback"`
}

type UpdateBulkFeedbackRequest struct {
	Feedbacks []FeedbackUpdate `json:"feedbacks"`
}

func UpdateBulkFeedback(feedbackRepository repository.FeedbackRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := UpdateBulkFeedbackRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		feedbacks := []*repository.Feedback{}
		status, ok := repository.FeedbackStatusMapper("REVIEWED")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}
		
		for _, feedback := range req.Feedbacks {
			feedbacks = append(feedbacks, &repository.Feedback{
				ID:             feedback.ID,
				Status:         status,
				LabelFeedback:  sql.NullString{
					String: feedback.LabelFeedback,
					Valid:  true,
				},
			})
		}

		if err := feedbackRepository.UpdateBulkFeedback(r.Context(), feedbacks); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}