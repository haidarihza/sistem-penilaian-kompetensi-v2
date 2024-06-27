package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)
type Feedback struct {
	ID            string `json:"id"`
	CompetencyID  string `json:"competency_id"`
	Transcript    string `json:"transcript"`
	Status        string `json:"status"`
	LabelResult   string `json:"label_result"`
	LabelFeedback string `json:"label_feedback"`
}

type GetAllNeedFeedbackResponse struct {
	Data []Feedback `json:"data"`
}

func GetAllNeedFeedback(feedbackRepository repository.FeedbackRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		feedbacks, err := feedbackRepository.SelectByStatus(r.Context(), "TO_LABEL")
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllNeedFeedbackResponse{
			Data: []Feedback{},
		}
		for _, fb := range feedbacks {
			label_feedback := ""
			if fb.LabelFeedback.Valid {
				label_feedback = fb.LabelFeedback.String
			}
			resp.Data = append(resp.Data, Feedback{
				ID:             fb.ID,
				CompetencyID:   fb.CompetencyID,
				Transcript:     fb.Transcript,
				Status:         string(fb.Status),
				LabelResult:    fb.LabelResult,
				LabelFeedback:  label_feedback,
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}