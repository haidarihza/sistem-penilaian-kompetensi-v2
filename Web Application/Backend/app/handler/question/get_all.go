package question

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type GetAllQuestionResponse struct {
	Data []Question `json:"data"`
}

func GetAll(questionRepository repository.QuestionRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		treatments, err := questionRepository.SelectAll(r.Context())
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllQuestionResponse{
			Data: []Question{},
		}
		for _, tr := range treatments {
			labels := make([]QuestionLabel, 0)
			for _, label := range tr.Labels {
				labels = append(labels, QuestionLabel{
					ID: label.ID,
					CompetencyID: label.CompetencyID,
				})
			}

			resp.Data = append(resp.Data, Question{
				ID:            tr.ID,
				Question:      tr.Question,
				DurationLimit: tr.DurationLimit,
				OrgPosition:   tr.OrgPosition,
				Labels:        labels,
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
