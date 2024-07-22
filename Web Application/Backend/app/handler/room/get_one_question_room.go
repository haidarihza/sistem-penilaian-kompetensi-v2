package room

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"fmt"

	"github.com/go-chi/chi/v5"
)

type OneQuestionRoom struct {
	ID               string 		`json:"id,omitempty"`
	Question    		 string			`json:"question,omitempty"`
	DurationLimit		 int    		`json:"duration_limit,omitempty"`
	StartAnswer			 string			`json:"start_answer,omitempty"`
}
type GetOneQuestionRoomResponse struct {
	Data OneQuestionRoom `json:"data"`
}

func GetOneQuestionRoom(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "roomId")
		questionId := chi.URLParam(r, "questionId")
		question, err := roomRepository.GetOneQuestionByRoomID(r.Context(), roomId, questionId)
		if err != nil {
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Question not found"))
				return
			}
			fmt.Println(err)
			response.RespondError(w, response.InternalServerError())
			return
		}

		startAnswer := "-"
		if question.StartAnswer.Valid {
			startAnswer = question.StartAnswer.String
		}

		response.Respond(w, http.StatusOK, GetOneQuestionRoomResponse{
			Data: OneQuestionRoom{
				ID:            question.ID,
				Question:      question.Question,
				DurationLimit: question.DurationLimit,
				StartAnswer:	 startAnswer,
			},
		})
	}
}
