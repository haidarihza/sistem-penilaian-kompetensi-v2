package competency

import (
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/google/uuid"
)

type CompetencyLevel struct {
	ID          string  `json:"id,omitempty"`
	Level       string  `json:"level,omitempty"`
	Description string  `json:"description,omitempty"`
	Result      float64 `json:"result,omitempty"`
}

type Competency struct {
	ID         string            `json:"id,omitempty"`
	Competency string            `json:"competency,omitempty"`
	Levels     []CompetencyLevel `json:"levels,omitempty"`
}

func Create(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Competency{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		newCompetency := &repository.Competency{
			ID:         uuid.NewString(),
			Competency: req.Competency,
		}

		var newLevelsUid []string
		var newLevelsLevel []string
		var newLevelsDescription []string
		for _, level := range req.Levels {
			newLevelsUid = append(newLevelsUid, uuid.NewString())
			newLevelsLevel = append(newLevelsLevel, level.Level)
			newLevelsDescription = append(newLevelsDescription, level.Description)
		}
		newLevels := &repository.Levels{
			IDs:          newLevelsUid,
			Levels:       newLevelsLevel,
			Descriptions: newLevelsDescription,
		}

		if err := competencyRepository.Insert(r.Context(), newCompetency, newLevels); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
