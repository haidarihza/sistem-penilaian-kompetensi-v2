package competency

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GetOneCompetencyResponse struct {
	Data Competency `json:"data"`
}

func GetOne(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		competencyId := chi.URLParam(r, "id")
		competency, err := competencyRepository.SelectOneByID(r.Context(), competencyId)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		if competency.ID == "" {
			response.RespondError(w, response.NotFoundError("Competency not found"))
			return
		}

		levels := make([]CompetencyLevel, 0)
		for _, lvl := range competency.Levels {
			levels = append(levels, CompetencyLevel{
				ID:          lvl.ID,
				Level:       lvl.Level,
				Description: lvl.Description,
			})
		}

		response.Respond(w, http.StatusOK, GetOneCompetencyResponse{
			Data: Competency{
				ID:         	competency.ID,
				Competency: 	competency.Competency,
				Description: 	competency.Description,
				Category:   	competency.Category,
				Levels:     	levels,
			},
		})
	}
}
