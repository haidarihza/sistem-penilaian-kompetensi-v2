package cron_job

import (
	"interview/summarization/repository"
	"net/http"
	"context"
	"fmt"
)

func TrainModel(feedbackRepository repository.FeedbackRepository, summarizationHost string) error {
	ctx := context.Background()

	// Check if data is available
	IsDataAvailable, err := feedbackRepository.IsDataAvailable(ctx)
	if err != nil {
			return err
	}

	if !IsDataAvailable {
			return nil
	}

	fmt.Println("Train data")
	url := summarizationHost + "/train"
	resp, err := http.Post(url, "application/json", nil)
	if err != nil {
			return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("failed to train model, status code: %d", resp.StatusCode)
	}

	return nil
}