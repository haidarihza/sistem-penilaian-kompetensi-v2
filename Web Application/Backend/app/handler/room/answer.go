package room

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"io"

	"net/http"
	// "net/url"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type AnswerReq struct {
	AnswerURL string `json:"answer_url,omitempty"`
}

type PredictResponse struct {
	Scores [][]float64 `json:"scores,omitempty"`
}

func Answer(
	roomRepository repository.RoomRepository,
	competencyRepository repository.CompetencyRepository,
	questionRepository repository.QuestionRepository,
	feedbackRepository repository.FeedbackRepository,
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

		fileLoc := req.AnswerURL

		go func(ctx context.Context, rRepo repository.RoomRepository, cRepo repository.CompetencyRepository, qRepo repository.QuestionRepository, fRepo repository.FeedbackRepository, fileLoc, roomId, questionId string) {
			fmt.Println("running in the background")
			payload := map[string]string{"link": fileLoc}
			jsonData, err := json.Marshal(payload)
			if err != nil {
				panic(err)
			}
		
			// Set the URL for the POST request
			url := speechToTextHost + "/predict"
		
			// Create the POST request with JSON payload
			resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
			defer resp.Body.Close()
			bodySpeech, _ := io.ReadAll(resp.Body)
			// fmt.Println(string(bodySpeech))

			rRepo.InsertTranscript(ctx, roomId, questionId, fileLoc, string(bodySpeech))
			if isAnswered, _ := rRepo.IsAnswered(ctx, roomId); isAnswered {
				answer, _ := rRepo.GetResultQuestions(ctx, roomId)
				questions, _ := qRepo.SelectAllByRoomID(ctx, roomId)
				competencies, _ := cRepo.SelectAllByRoomID(ctx, roomId)

				var mapKamus [][]string
				var transcripts []string
				for _, c := range competencies {
					var mapLevel []string
					transcript := ""
					for _, q := range questions {
						for _, ql := range q.Labels {
							if ql.CompetencyID == c.ID {
								transcript += answer[q.ID] + " "
							}
						}
					}
					for _, cl := range c.Levels {
						mapLevel = append(mapLevel, cl.Description)
					}
					mapKamus = append(mapKamus, mapLevel)
					transcripts = append(transcripts, transcript)
				}

				body, _ := json.Marshal(map[string]interface{}{
					"transcripts": 			transcripts,
					"competence_sets":  mapKamus,
				})

				url := summarizationHost + "/predict"
				resp, _ := http.Post(url, "application/json", bytes.NewBuffer(body))
				bodySummary, _ := io.ReadAll(resp.Body)

				res := PredictResponse{}
				err := json.Unmarshal(bodySummary, &res)
				if err != nil {
					fmt.Println(err)
				}
				// for result
				var competencyRes []string
				var levelRes []string
				var resultRes []float64

				// for feedback
				var feedbackID []string
				var competencyFeedback []string
				var transcriptFeedback []string
				var resultFeedback []string

				for i, c := range competencies {
					feedbackID = append(feedbackID, uuid.NewString())
					competencyFeedback = append(competencyFeedback, c.ID)
					transcriptFeedback = append(transcriptFeedback, transcripts[i])
					maxIndex := 0
					maxScore := -1.0
					for j, cl := range c.Levels {
						competencyRes = append(competencyRes, c.Competency)
						levelRes = append(levelRes, cl.Level)
						resultRes = append(resultRes, res.Scores[i][j])
						if res.Scores[i][j] > maxScore {
							maxScore = res.Scores[i][j]
							maxIndex = j
						}
					}
					resultFeedback = append(resultFeedback, c.Levels[maxIndex].ID)
				}

				rRepo.InsertResult(ctx, roomId, competencyRes, levelRes, resultRes)
				fRepo.Insert(ctx, feedbackID, transcriptFeedback, competencyFeedback, resultFeedback)
			}
		}(context.Background(), roomRepository, competencyRepository, questionRepository, feedbackRepository, fileLoc, roomId, questionId)
		response.RespondOK(w)
	}
}
