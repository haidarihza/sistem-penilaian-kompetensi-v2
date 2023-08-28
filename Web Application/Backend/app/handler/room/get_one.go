package room

import (
	"database/sql"
	"fmt"
	"interview/summarization/app/handler"
	"interview/summarization/app/handler/competency"
	"interview/summarization/app/handler/question"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type GetOneRoomResponse struct {
	Data Room `json:"data"`
}

func GetOne(
	roomRepository repository.RoomRepository,
	questionRepository repository.QuestionRepository,
	competencyRepository repository.CompetencyRepository,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "id")
		userCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		room, err := roomRepository.SelectOneByIDUserID(r.Context(), roomId, userCred.ID)
		if err != nil {
			fmt.Println(err)
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Room not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}
		submission := "-"
		if room.Submission.Valid {
			submission = room.Submission.String
		}

		note := "-"
		if room.Note.Valid {
			note = room.Note.String
		}

		resp := GetOneRoomResponse{
			Data: Room{
				ID:          room.ID,
				Title:       room.Title,
				Description: room.Description,
				Start:       room.Start,
				End:         room.End,
				Submission:  submission,
				Status:      room.Status,
				Note:        note,
			},
		}

		questions, err := questionRepository.SelectAllByRoomID(r.Context(), roomId)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		for _, qt := range questions {
			resp.Data.Questions = append(resp.Data.Questions, question.Question{
				ID:            qt.ID,
				Question:      qt.Question,
				DurationLimit: qt.DurationLimit,
			})
		}
		if userCred.Role == repository.Interviewer {
			resp.Data.IntervieweeName = room.Interviewee.Name
			resp.Data.IntervieweeEmail = room.Interviewee.Email
			resp.Data.IntervieweePhone = room.Interviewee.Phone

			var resultCompetency repository.ResultCompetency
			var resultQuestion repository.ResultQuestion
			if resp.Data.Status != "Menunggu Jawaban" {
				resultCompetency, err = roomRepository.GetResultCompetencies(r.Context(), roomId)
				if err != nil {
					response.RespondError(w, response.InternalServerError())
					return
				}

				resultQuestion, err = roomRepository.GetResultQuestions(r.Context(), roomId)
				if err != nil {
					response.RespondError(w, response.InternalServerError())
					return
				}
			}

			competencies, err := competencyRepository.SelectAllByRoomID(r.Context(), roomId)
			if err != nil {
				response.RespondError(w, response.InternalServerError())
				return
			}

			for _, cp := range competencies {
				compe := competency.Competency{
					ID:         cp.ID,
					Competency: cp.Competency,
					Levels:     []competency.CompetencyLevel{},
				}
				for _, cpl := range cp.Levels {
					level := competency.CompetencyLevel{
						ID:          cpl.ID,
						Level:       cpl.Level,
						Description: cpl.Description,
					}
					if len(resultCompetency) > 0 {
						level.Result = resultCompetency[cp.Competency][cpl.Level]
					}

					compe.Levels = append(compe.Levels, level)
				}

				resp.Data.Competencies = append(resp.Data.Competencies, compe)
			}

			if len(resultQuestion) > 0 {
				for idx, question := range resp.Data.Questions {
					question.Transcript = resultQuestion[question.ID]
					resp.Data.Questions[idx] = question
				}
			}
		}

		response.Respond(w, http.StatusOK, resp)
	}
}
