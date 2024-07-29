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
)


func UpdateQuestionsAndCompetenciesRoom(roomRepository repository.RoomRepository, userRepository repository.UserRepository, cfg config.Config) http.HandlerFunc {
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

    go func(ctx context.Context, interviewee repository.User) {
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

      timeStart, err := time.Parse(layout, req.Start)
      if err != nil {
        fmt.Println("Error parsing time:", err)
        return
      }
      localTimeStart := timeStart.Local()
      formattedTimeStart := localTimeStart.Format("02 January 2006 15:04:05 MST")
      
      timeEnd, err := time.Parse(layout, req.End)
      if err != nil {
        fmt.Println("Error parsing time:", err)
        return
      }
      localTimeEnd := timeEnd.Local()
      formattedTimeEnd := localTimeEnd.Format("02 January 2006 15:04:05 MST")
  
      url := fmt.Sprintf("http://%s:%s/room-group/%s", cfg.FEHost, cfg.FEPort, req.ID)

      data := struct {
        Judul template.HTML
        Nama template.HTML
        WaktuMulai template.HTML
        WaktuSelesai template.HTML
        URL template.HTML
      }{
        Judul: template.HTML(req.Title),
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
    }(context.Background(), *interviewee)

    if err := roomRepository.UpdateQuestionsAndCompetenciesRoom(r.Context(), req.ID, req.QuestionsID, req.CompetenciesID, status); err != nil {
      fmt.Println(err)
      response.RespondError(w, response.InternalServerError())
      return
    }

    response.RespondOK(w)
  }
}

