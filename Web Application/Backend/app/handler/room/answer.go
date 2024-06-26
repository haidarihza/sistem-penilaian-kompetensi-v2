package room

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"io"
	"math"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
)

type AnswerReq struct {
	answerURL string `json:"answer_url,omitempty"`
}

func Answer(
	roomRepository repository.RoomRepository,
	competencyRepository repository.CompetencyRepository,
	apiHost, speechToTextHost, summarizationHost string,
) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomId := chi.URLParam(r, "roomId")
		questionId := chi.URLParam(r, "questionId")
		// validasi room has question

		req := AnswerReq{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		fileLoc := req.answerURL

		go func(ctx context.Context, rRepo repository.RoomRepository, cRepo repository.CompetencyRepository, fileLoc, roomId, questionId string) {
			fmt.Println("running in the background")
			form := url.Values{}
			form.Add("link", fileLoc)

			resp, _ := http.PostForm(speechToTextHost, form)
			bodySpeech, _ := io.ReadAll(resp.Body)
			fmt.Println(string(bodySpeech))

			rRepo.InsertTranscript(ctx, roomId, questionId, fileLoc, string(bodySpeech))
			if isAnswered, _ := rRepo.IsAnswered(ctx, roomId); isAnswered {
				answer, _ := rRepo.GetAnswers(ctx, roomId)
				competencies, _ := cRepo.SelectAllByRoomID(ctx, roomId)
				fmt.Println(answer)

				mapKamus := map[string]map[string]string{}
				for _, c := range competencies {
					mapLevel := map[string]string{}
					for _, cl := range c.Levels {
						mapLevel[cl.Level] = cl.Description
					}

					mapKamus[c.Competency] = mapLevel
				}
				body, _ := json.Marshal(map[string]interface{}{
					"transkrip": answer,
					"kamus":     mapKamus,
				})

				resp, _ := http.Post(summarizationHost, "application/json", bytes.NewBuffer(body))
				bodySummary, _ := io.ReadAll(resp.Body)

				fmt.Println(string(bodySummary))

				result := map[string]map[string]float64{}
				json.Unmarshal(bodySummary, &result)

				var competencyRes []string
				var levelRes []string
				var resultRes []float64
				for kc, c := range result {
					for kr, r := range c {
						competencyRes = append(competencyRes, kc)
						levelRes = append(levelRes, kr)
						resultRes = append(resultRes, math.Round(r*1000)/1000)
					}
				}

				rRepo.InsertResult(ctx, roomId, competencyRes, levelRes, resultRes)
			}
		}(context.Background(), roomRepository, competencyRepository, fileLoc, roomId, questionId)
		response.RespondOK(w)
	}
}
