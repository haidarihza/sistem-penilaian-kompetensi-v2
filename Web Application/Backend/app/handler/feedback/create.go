package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"encoding/json"

	"github.com/google/uuid"
)

func Create(feedbackRepository repository.FeedbackRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Feedback{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		newFeedback := &repository.Feedback{
			ID:            uuid.NewString(),
			CompetencyID:  req.CompetencyID,
			Transcript:    req.Transcript,
			LabelResult:   req.LabelResult,
		}

		if err := feedbackRepository.Insert(r.Context(), newFeedback); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}