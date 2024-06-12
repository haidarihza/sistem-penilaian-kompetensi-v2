package competency

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type GetAllCompetencyResponse struct {
	Data []Competency `json:"data"`
}

func GetAll(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		competencies, err := competencyRepository.SelectAll(r.Context())
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllCompetencyResponse{
			Data: []Competency{},
		}
		for _, cp := range competencies {
			levels := make([]CompetencyLevel, 0)
			for _, lvl := range cp.Levels {
				levels = append(levels, CompetencyLevel{
					ID:          lvl.ID,
					Level:       lvl.Level,
					Description: lvl.Description,
				})
			}

			resp.Data = append(resp.Data, Competency{
				ID:         cp.ID,
				Competency: cp.Competency,
				Description: cp.Description,
				Levels:     levels,
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
