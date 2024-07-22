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
		room, err := roomRepository.SelectOneRoomByID(r.Context(), roomId)
		if err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Room not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}
		roomGroupId := room.RoomGroupID
		if err := roomRepository.DeleteByID(r.Context(), roomId, roomGroupId); err != nil {
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