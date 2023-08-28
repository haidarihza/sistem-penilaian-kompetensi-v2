package competency

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Delete(competencyRepository repository.CompetencyRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		competencyId := chi.URLParam(r, "id")
		if err := competencyRepository.DeleteByID(r.Context(), competencyId); err != nil {
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
