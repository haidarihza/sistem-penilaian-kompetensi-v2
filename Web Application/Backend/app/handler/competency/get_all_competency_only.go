package competency

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type GetAllCompetencyOnlyResponse struct {
	Data []Competency `json:"data"`
}

func GetAllCompetencyOnly(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		competencies, err := competencyRepository.SelectAllCompetencyOnly(r.Context())
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllCompetencyOnlyResponse{
			Data: []Competency{},
		}
		for _, cp := range competencies {
			resp.Data = append(resp.Data, Competency{
				ID:         cp.ID,
				Competency: cp.Competency,
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
