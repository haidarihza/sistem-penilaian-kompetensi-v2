package feedback

import (
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"net/http"
	"encoding/json"
	"io"
	"fmt"
)
type Feedback struct {
	ID            string `json:"id"`
	CompetencyID  string `json:"competency_id"`
	Transcript    string `json:"transcript"`
	Status        string `json:"status"`
	LabelResult   string `json:"label_result"`
	LabelFeedback string `json:"label_feedback"`
}

type GetAllNeedFeedbackResponse struct {
	Data []Feedback `json:"data"`
}

type ToLabelResponse struct {
	Ids 		[]string `json:"id"`
	Scores 	[]float64 `json:"scores"`
}

func GetAllNeedFeedback(feedbackRepository repository.FeedbackRepository, summarizationHost string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		isNoDataToLabel, err := feedbackRepository.IsNoDataToLabel(r.Context())
		if err != nil {
			return
		}

		if isNoDataToLabel {
			fmt.Println("Get data to labeled")
			url := summarizationHost + "/to-label"
			resp,_ := http.Get(url)
			if resp.StatusCode != http.StatusOK {
				return
			}
			defer resp.Body.Close()
			bodyLabel, _ := io.ReadAll(resp.Body)

			res := ToLabelResponse{}
			err := json.Unmarshal(bodyLabel, &res)
			if err != nil {
				fmt.Println(err)
			}

			err = feedbackRepository.UpdateBulkFeedback(r.Context(), res.Ids)
			if err != nil {
				return
			}
		}

		feedbacks, err := feedbackRepository.SelectByStatus(r.Context(), "TO_LABEL")
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		resp := GetAllNeedFeedbackResponse{
			Data: []Feedback{},
		}
		for _, fb := range feedbacks {
			label_feedback := ""
			if fb.LabelFeedback.Valid {
				label_feedback = fb.LabelFeedback.String
			}
			resp.Data = append(resp.Data, Feedback{
				ID:             fb.ID,
				CompetencyID:   fb.CompetencyID,
				Transcript:     fb.Transcript,
				Status:         string(fb.Status),
				LabelResult:    fb.LabelResult,
				LabelFeedback:  label_feedback,
			})
		}

		response.Respond(w, http.StatusOK, resp)
	}
}