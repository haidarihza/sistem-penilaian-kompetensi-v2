package room

import (
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
)

type RoomResponse struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	IntervieweeName string `json:"interviewee_name"`
	Start           string `json:"start"`
	End             string `json:"end"`
	Email           string `json:"interviewee_email"`
	Submission      string `json:"submission"`
	Status          string `json:"status"`
}

type GetAllRoomResponse struct {
	Data []RoomResponse `json:"data"`
}

func GetAll(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllRoomResponse{
			Data: []RoomResponse{},
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

				resp.Data = append(resp.Data, RoomResponse{
					ID:              room.ID,
					Title:           room.Title,
					IntervieweeName: room.Interviewee.Name,
					Start:           room.Start,
					End:             room.End,
					Email:           room.Interviewee.Email,
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
				resp.Data = append(resp.Data, RoomResponse{
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
