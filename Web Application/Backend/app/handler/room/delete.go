package room

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func Delete(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "id")
		if err := roomRepository.DeleteByID(r.Context(), roomId); err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Room not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}