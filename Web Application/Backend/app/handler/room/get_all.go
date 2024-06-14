package room

import (
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type GetAllRoomResponse struct {
	Data []Room `json:"data"`
}

func GetAll(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllRoomResponse{
			Data: []Room{},
		}
		if userCred.Role == repository.Interviewer {
			rooms, err := roomRepository.SelectAllByInterviewerID(r.Context(), userCred.ID)
			if err != nil {
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, room := range rooms {
				submission := "-"
				if room.Submission.Valid {
					submission = room.Submission.String
				}

				resp.Data = append(resp.Data, Room{
					ID:              room.ID,
					Title:           room.Title,
					IntervieweeName: room.Interviewee.Name,
					End:             room.End,
					Submission:      submission,
					Status:          string(room.Status),
				})
			}
		} else if userCred.Role == repository.Interviewee {
			rooms, err := roomRepository.SelectAllByIntervieweeID(r.Context(), userCred.ID)
			if err != nil {
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, room := range rooms {
				resp.Data = append(resp.Data, Room{
					ID:     room.ID,
					Title:  room.Title,
					Start:  room.Start,
					End:    room.End,
					Status: string(room.Status),
				})
			}
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
