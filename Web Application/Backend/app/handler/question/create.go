package question

import (
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/google/uuid"
)

type QuestionLabel struct {
	ID          	string `json:"id,omitempty"`
	CompetencyID 	string `json:"competency_id,omitempty"`
}

type Question struct {
	ID            string `json:"id,omitempty"`
	Question      string `json:"question,omitempty"`
	DurationLimit int    `json:"duration_limit,omitempty"`
	OrgPosition	 	string `json:"org_position,omitempty"`
	Transcript    string `json:"transcript,omitempty"`
	StartAnswer		string `json:"start_answer,omitempty"`
	Labels				[]QuestionLabel `json:"labels,omitempty"`
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
			OrgPosition:   req.OrgPosition,
		}

		var newLabelsUid []string
		var newLabelsCompetencyUid []string
		for _, label := range req.Labels {
			newLabelsUid = append(newLabelsUid, uuid.NewString())
			newLabelsCompetencyUid = append(newLabelsCompetencyUid, label.CompetencyID)
		}
		newLabels := &repository.Labels{
			IDs: newLabelsUid,
			CompetencyIDs: newLabelsCompetencyUid,
		}

		if err := questionRepository.Insert(r.Context(), newQuestion, newLabels); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
