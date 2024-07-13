package room

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GetOneRoomGroupResponse struct {
	Data RoomGroupResponse `json:"data"`
}

func GetOneRoomGroup(
	roomRepository repository.RoomRepository,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomGroupId := chi.URLParam(r, "id")

		roomGroup, err := roomRepository.SelectRoomGroupByID(r.Context(), roomGroupId)
		rooms, err := roomRepository.SelectAllRoomByGroupID(r.Context(), roomGroupId)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetOneRoomGroupResponse{
			Data: RoomGroupResponse{
				ID:               roomGroup.ID,
				Title:            roomGroup.Title,
				OrgPosition:      roomGroup.OrgPosition,
				IntervieweeName:  roomGroup.Interviewee.Name,
				IntervieweeEmail: roomGroup.Interviewee.Email,
				IntervieweePhone: roomGroup.Interviewee.Phone,
				Room:             []RoomResponse{},
			},
		}

		for _, room := range rooms {
			submission := "-"
			if room.Submission.Valid {
				submission = room.Submission.String
			}

			roomResponse := RoomResponse{
				ID:              room.ID,
				Title:           room.Title,
				Start:           room.Start,
				End:             room.End,
				Submission:      submission,
				Status:          string(room.Status),
			}

			resp.Data.Room = append(resp.Data.Room, roomResponse)
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
