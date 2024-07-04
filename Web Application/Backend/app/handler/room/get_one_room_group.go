package room

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GetOneRoomGroupResponse struct {
	Data []Room `json:"data"`
}

func GetOneRoomGroup(
	roomRepository repository.RoomRepository,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomGroupId := chi.URLParam(r, "id")

		rooms, err := roomRepository.SelectAllRoomByGroupID(r.Context(), roomGroupId)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := []Room{}
		for _, room := range rooms {
			submission := "-"
			if room.Submission.Valid {
				submission = room.Submission.String
			}
			resp = append(resp, Room{
				ID:               room.ID,
				Title:            room.Title,
				Start:            room.Start,
				End:              room.End,
				Submission:       submission,
				Status:           string(room.Status),
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
