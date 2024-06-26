package room

import (
	"context"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func FinishAnswer(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "roomId")

		status, ok := repository.RoomStatusMapper("WAITING REVIEW")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		room := &repository.Room{
			ID:        	roomId,
			Status:    	status,
		}

		if err := roomRepository.UpdateStatusAndSubmission(context.Background(), room); err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}	