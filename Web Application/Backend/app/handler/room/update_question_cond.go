package room

import (
	"database/sql"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"fmt"
	"encoding/json"

	"github.com/go-chi/chi/v5"
)
type UpdateQuestionCondReq struct {
	StartAnswer			string 		`json:"start_answer,omitempty"`
	CurrQuestion		int				`json:"current_question"`
	IsStarted				bool			`json:"is_started"`
}

func UpdateQuestionCond(roomRepository repository.RoomRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "roomId")
		questionId := chi.URLParam(r, "questionId")

		req := UpdateQuestionCondReq{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}
	
		if err := roomRepository.UpdateQuestionByRoomID(r.Context(), roomId, questionId, req.StartAnswer); err != nil {
			fmt.Println(err)
			if err == sql.ErrNoRows {
				response.RespondError(w, response.NotFoundError("Question not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		if err := roomRepository.UpdateRoomQuestionCond(r.Context(), roomId, req.CurrQuestion, req.IsStarted); err != nil {
			fmt.Println(err)
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
