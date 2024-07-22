package room

import (
	"database/sql"
	"encoding/json"
	"errors"
	"interview/summarization/app/handler/competency"
	"interview/summarization/app/handler/question"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"interview/summarization/config"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"context"
	"html/template"
	"bytes"
	"fmt"
	"time"
	"github.com/google/uuid"
)

type Room struct {
	ID               string                  `json:"id,omitempty"`
	Title            string                  `json:"title,omitempty"`
	Description      string                  `json:"description,omitempty"`
	Start            string                  `json:"start,omitempty"`
	End              string                  `json:"end,omitempty"`
	IsStarted				 bool										 `json:"is_started"`
	CurrQuestion		 int										 `json:"current_question"`
	Submission       string                  `json:"submission,omitempty"`
	Status           string                  `json:"status,omitempty"`
	Note             string                  `json:"note,omitempty"`
	IntervieweeEmail string         	       `json:"interviewee_email,omitempty"`
	IntervieweeName  string                  `json:"interviewee_name,omitempty"`
	IntervieweePhone string                  `json:"interviewee_phone,omitempty"`
	InterviewerEmail string                  `json:"interviewer_email,omitempty"`
	InterviewerName  string                  `json:"interviewer_name,omitempty"`
	Language				 string									 `json:"language,omitempty"`
	QuestionsID      []string                `json:"questions_id,omitempty"`
	CompetenciesID   []string                `json:"competencies_id,omitempty"`
	Questions        []question.Question     `json:"questions,omitempty"`
	Competencies     []competency.Competency `json:"competencies,omitempty"`
}

type RoomCreate struct {
	ID               string                  `json:"id,omitempty"`
	RoomGroupID      string                  `json:"room_group_id,omitempty"`
	Title            string                  `json:"title,omitempty"`
	Description      string                  `json:"description,omitempty"`
	Start            string                  `json:"start,omitempty"`
	End              string                  `json:"end,omitempty"`
	Submission       string                  `json:"submission,omitempty"`
	Status           string                  `json:"status,omitempty"`
	Note             string                  `json:"note,omitempty"`
	InterviewerEmail string                  `json:"interviewer_email,omitempty"`
	IntervieweeEmail string		 	             `json:"interviewee_email,omitempty"`
	Language				 string									 `json:"language,omitempty"`
	QuestionsID      []string                `json:"questions_id,omitempty"`
	CompetenciesID   []string                `json:"competencies_id,omitempty"`
	Questions        []question.Question     `json:"questions,omitempty"`
	Competencies     []competency.Competency `json:"competencies,omitempty"`
}

func CreateRoom(roomRepository repository.RoomRepository, userRepository repository.UserRepository, cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := RoomCreate{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		status, ok := repository.RoomStatusMapper("WAITING ANSWER")
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

		interviewer, err := userRepository.SelectIDByEmail(r.Context(), req.InterviewerEmail)
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
			InterviewerID: interviewer.ID,
			RoomGroupID:   req.RoomGroupID,
			Title:         req.Title,
			Start:         req.Start,
			End:           req.End,
			Description:   req.Description,
			Status:        status,
			Language:			 req.Language,
		}

		go func(ctx context.Context, room repository.Room, interviewee repository.User) {
			auth := smtp.PlainAuth(cfg.SenderIdentity, cfg.SenderEmail, cfg.SenderPassword, cfg.AddressHost)

			cwd, err := os.Getwd()
			if err != nil {
					fmt.Println("Error getting current working directory:", err)
					return
			}
			tmplPath := filepath.Join(cwd, "/email_templates/create_room_template.html")

			tmpl, err := template.ParseFiles(tmplPath)
			if err != nil {
					fmt.Println("Error parsing template:", err)
					return
			}

			layout := "2006-01-02T15:04:05.000Z"

			timeStart, err := time.Parse(layout, room.End)
			if err != nil {
				fmt.Println("Error parsing time:", err)
				return
			}
			localTimeStart := timeStart.Local()
			formattedTimeStart := localTimeStart.Format("02 January 2006 15:04:05 MST")
			
			timeEnd, err := time.Parse(layout, room.End)
			if err != nil {
				fmt.Println("Error parsing time:", err)
				return
			}
			localTimeEnd := timeEnd.Local()
			formattedTimeEnd := localTimeEnd.Format("02 January 2006 15:04:05 MST")
	
			url := fmt.Sprintf("http://%s:%s/room/%s", cfg.FEHost, cfg.FEPort, room.ID)

			data := struct {
				Judul template.HTML
				Nama template.HTML
				WaktuMulai template.HTML
				WaktuSelesai template.HTML
				URL template.HTML
			}{
				Judul: template.HTML(room.Title),
				Nama: template.HTML(interviewee.Name),
				WaktuMulai: template.HTML(formattedTimeStart),
				WaktuSelesai: template.HTML(formattedTimeEnd),
				URL: template.HTML(url),
			}

			var renderedContent bytes.Buffer
			err = tmpl.Execute(&renderedContent, data)
			if err != nil {
					fmt.Println("Error executing template:", err)
					return
			}

			content := "Subject: Interview Invitation\nMIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n" + renderedContent.String()
			err = smtp.SendMail(fmt.Sprintf("%s:%d", cfg.AddressHost, cfg.AddressPort), auth, cfg.SenderEmail, []string{interviewee.Email}, []byte(content))
			if err != nil {
					fmt.Println("Error sending email:", err)
					return
			}
		}(context.Background(), *newRoom, *interviewee)

		if err := roomRepository.Insert(r.Context(), newRoom, req.QuestionsID, req.CompetenciesID); err != nil {
			fmt.Println(err)
			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
