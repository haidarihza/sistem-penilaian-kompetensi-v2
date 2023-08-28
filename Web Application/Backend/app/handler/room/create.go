package room

import (
	"database/sql"
	"encoding/json"
	"errors"
	"interview/summarization/app/handler"
	"interview/summarization/app/handler/competency"
	"interview/summarization/app/handler/question"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"

	"github.com/google/uuid"
)

type Room struct {
	ID               string                  `json:"id,omitempty"`
	Title            string                  `json:"title,omitempty"`
	Description      string                  `json:"description,omitempty"`
	Start            string                  `json:"start,omitempty"`
	End              string                  `json:"end,omitempty"`
	Submission       string                  `json:"submission,omitempty"`
	Status           string                  `json:"status,omitempty"`
	Note             string                  `json:"note,omitempty"`
	IntervieweeEmail string                  `json:"interviewee_email,omitempty"`
	IntervieweeName  string                  `json:"interviewee_name,omitempty"`
	IntervieweePhone string                  `json:"interviewee_phone,omitempty"`
	QuestionsID      []string                `json:"questions_id,omitempty"`
	CompetenciesID   []string                `json:"competencies_id,omitempty"`
	Questions        []question.Question     `json:"questions,omitempty"`
	Competencies     []competency.Competency `json:"competencies,omitempty"`
}

type RoomCreateResponse struct {
	ID string `json:"id"`
}

func Create(roomRepository repository.RoomRepository, userRepository repository.UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := Room{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		interviewerCred, ok := r.Context().Value(handler.UserContextKey).(handler.UserCtx)
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		interviewee, err := userRepository.SelectIDByEmail(r.Context(), req.IntervieweeEmail)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				response.RespondError(w, response.NotFoundError("User not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		newRoom := &repository.Room{
			ID:            uuid.NewString(),
			InterviewerID: interviewerCred.ID,
			IntervieweeID: interviewee.ID,
			Title:         req.Title,
			Start:         req.Start,
			End:           req.End,
			Description:   req.Description,
		}

		newID, err := roomRepository.Insert(r.Context(), newRoom, req.QuestionsID, req.CompetenciesID)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.Respond(w, http.StatusCreated, RoomCreateResponse{
			ID: newID,
		})
	}
}
