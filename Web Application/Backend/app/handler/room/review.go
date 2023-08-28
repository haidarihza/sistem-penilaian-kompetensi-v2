package room

import (
	"database/sql"
	"encoding/json"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type ReviewRoom struct {
	Status string `json:"status,omitempty"`
	Note   string `json:"note,omitempty"`
}

func Review(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := ReviewRoom{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		roomId := chi.URLParam(r, "id")

		room := &repository.Room{
			ID:     roomId,
			Status: req.Status,
			Note: sql.NullString{
				String: req.Note,
			},
		}
		if err := roomRepository.Review(r.Context(), room); err != nil {
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
