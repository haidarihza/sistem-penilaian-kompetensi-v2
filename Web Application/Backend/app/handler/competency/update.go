package competency

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func Update(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Competency{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		competencyId := chi.URLParam(r, "id")

		updatedCompetency := &repository.Competency{
			ID:         competencyId,
			Competency: req.Competency,
			Description: req.Description,
		}

		var updatedLevelsUid []string
		var updatedLevelsLevel []string
		var updatedLevelsDescription []string
		for _, level := range req.Levels {
			if level.ID == "" {
				level.ID = uuid.NewString()
			}
			updatedLevelsUid = append(updatedLevelsUid, level.ID)
			updatedLevelsLevel = append(updatedLevelsLevel, level.Level)
			updatedLevelsDescription = append(updatedLevelsDescription, level.Description)
		}
		updatedLevels := &repository.Levels{
			IDs:          updatedLevelsUid,
			Levels:       updatedLevelsLevel,
			Descriptions: updatedLevelsDescription,
		}

		if err := competencyRepository.Upsert(r.Context(), updatedCompetency, updatedLevels); err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Competency not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
