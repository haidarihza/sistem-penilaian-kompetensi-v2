package room

import (
	"database/sql"
	"encoding/json"
	"errors"
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

type RoomGroupsCreate struct {
	ID               	string                 `json:"id,omitempty"`
	Title            	string                 `json:"title,omitempty"`
	OrgPosition				string                 `json:"org_position,omitempty"`
	IntervieweeEmail 	[]string       	       `json:"interviewee_email,omitempty"`
	Room	           	RoomCreate       	     `json:"room,omitempty"`
}

func CreateRoomGroup(roomRepository repository.RoomRepository, userRepository repository.UserRepository, cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := RoomGroupsCreate{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		status, ok := repository.RoomStatusMapper("WAITING ANSWER")
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}

		interviewer, err := userRepository.SelectIDByEmail(r.Context(), req.Room.InterviewerEmail)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				response.RespondError(w, response.NotFoundError("User not found"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		for _, email := range req.IntervieweeEmail {
			interviewee, err := userRepository.SelectIDByEmail(r.Context(), email)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					response.RespondError(w, response.NotFoundError("User not found"))
					return
				}

				response.RespondError(w, response.InternalServerError())
				return
			}

			newRoomGroup := &repository.RoomGroup{
				ID:            uuid.NewString(),
				Title:         req.Title,
				OrgPosition:   req.OrgPosition,
				IntervieweeID: interviewee.ID,
			}

			newRoom := &repository.Room{
				ID:            uuid.NewString(),
				InterviewerID: interviewer.ID,
				RoomGroupID:   newRoomGroup.ID,
				Title:         req.Room.Title,
				Description:   req.Room.Description,
				Start:         req.Room.Start,
				End:           req.Room.End,
				Status:        status,
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

			if err := roomRepository.InsertRoomGroup(r.Context(), newRoomGroup); err != nil {
				fmt.Println(err)
				response.RespondError(w, response.InternalServerError())
				return
			}
			if err := roomRepository.Insert(r.Context(), newRoom, req.Room.QuestionsID, req.Room.CompetenciesID); err != nil {
				fmt.Println(err)
				response.RespondError(w, response.InternalServerError())
				return
			}
		}

		response.RespondOK(w)
	}
}
