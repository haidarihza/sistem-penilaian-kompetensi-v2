package room

import (
	"interview/summarization/app/handler"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"fmt"
)
type RoomResponse struct {
	ID              string `json:"id"`
	Title           string `json:"title"`
	InterviewerName string `json:"interviewer_name"`
	Start           string `json:"start"`
	End             string `json:"end"`
	Submission      string `json:"submission"`
	Status          string `json:"status"`
}

type RoomGroupResponse struct {
	ID               string 				`json:"id"`
	Title            string 				`json:"title"`
	OrgPosition      string 				`json:"org_position"`
	IntervieweeName	 string 				`json:"interviewee_name"`
	IntervieweeEmail string 				`json:"interviewee_email"`
	IntervieweePhone string 				`json:"interviewee_phone"`
	Room						 []RoomResponse `json:"room"`
}

type GetAllRoomGroupResponse struct {
	Data []RoomGroupResponse `json:"data"`
}

func GetAllRoomGroup(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllRoomGroupResponse{
			Data: []RoomGroupResponse{},
		}

		if userCred.Role == repository.Hrd {
			roomGroups, err := roomRepository.SelectAllRoomGroup(r.Context())
			if err != nil {
				fmt.Println(err)
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, roomGroup := range roomGroups {
				rooms, err := roomRepository.SelectAllRoomByGroupID(r.Context(), roomGroup.ID)
				if err != nil {
					fmt.Println(err)
					response.RespondError(w, response.InternalServerError())
					return
				}

				roomResponse := []RoomResponse{}
				for _, room := range rooms {
					submission := "-"
					if room.Submission.Valid {
						submission = room.Submission.String
					}

					roomResponse = append(roomResponse, RoomResponse{
						ID:              room.ID,
						Title:           room.Title,
						InterviewerName: room.Interviewer.Name,
						Start:           room.Start,
						End:             room.End,
						Submission:      submission,
						Status:          string(room.Status),
					})
				}

				resp.Data = append(resp.Data, RoomGroupResponse{
					ID:               roomGroup.ID,
					Title:            roomGroup.Title,
					OrgPosition:      roomGroup.OrgPosition,
					IntervieweeName:  roomGroup.Interviewee.Name,
					IntervieweeEmail: roomGroup.Interviewee.Email,
					Room:             roomResponse,
				})
			}
		} else if userCred.Role == repository.Interviewer {
			roomGroups, err := roomRepository.SelectAllRoomGroupByInterviewerID(r.Context(), userCred.ID)
			if err != nil {
				fmt.Println(err)
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, roomGroup := range roomGroups {
				rooms, err := roomRepository.SelectAllRoomByGroupID(r.Context(), roomGroup.ID)
				if err != nil {
					fmt.Println(err)
					response.RespondError(w, response.InternalServerError())
					return
				}

				roomResponse := []RoomResponse{}
				for _, room := range rooms {
					submission := "-"
					if room.Submission.Valid {
						submission = room.Submission.String
					}

					roomResponse = append(roomResponse, RoomResponse{
						ID:              room.ID,
						Title:           room.Title,
						InterviewerName: room.Interviewer.Name,
						Start:           room.Start,
						End:             room.End,
						Submission:      submission,
						Status:          string(room.Status),
					})
				}

				resp.Data = append(resp.Data, RoomGroupResponse{
					ID:               roomGroup.ID,
					Title:            roomGroup.Title,
					OrgPosition:      roomGroup.OrgPosition,
					IntervieweeName:  roomGroup.Interviewee.Name,
					IntervieweeEmail: roomGroup.Interviewee.Email,
					Room:             roomResponse,
				})
			}
		} else if userCred.Role == repository.Interviewee {
			roomGroups, err := roomRepository.SelectAllRoomGroupByIntervieweeID(r.Context(), userCred.ID)
			if err != nil {
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, roomGroup := range roomGroups {
				rooms, err := roomRepository.SelectAllRoomByGroupID(r.Context(), roomGroup.ID)
				if err != nil {
					response.RespondError(w, response.InternalServerError())
					return
				}

				roomResponse := []RoomResponse{}
				for _, room := range rooms {
					submission := "-"
					if room.Submission.Valid {
						submission = room.Submission.String
					}

					roomResponse = append(roomResponse, RoomResponse{
						ID:              room.ID,
						Title:           room.Title,
						InterviewerName: room.Interviewer.Name,
						Start:           room.Start,
						End:             room.End,
						Submission:      submission,
						Status:          string(room.Status),
					})
				}

				resp.Data = append(resp.Data, RoomGroupResponse{
					ID:               roomGroup.ID,
					Title:            roomGroup.Title,
					OrgPosition:      roomGroup.OrgPosition,
					IntervieweeName:  roomGroup.Interviewee.Name,
					IntervieweeEmail: roomGroup.Interviewee.Email,
					Room:             roomResponse,
				})
			}
		}
		response.Respond(w, http.StatusOK, resp)
	}
}