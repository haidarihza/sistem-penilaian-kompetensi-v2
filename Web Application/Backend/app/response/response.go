package response

import (
	"encoding/json"
	"net/http"
)

type CommonMessage struct {
	Message string `json:"message"`
}

func Respond(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func RespondOK(w http.ResponseWriter) {
	Respond(w, http.StatusOK, CommonMessage{"OK"})
}

func RespondError(w http.ResponseWriter, err Error) {
	Respond(w, err.StatusCode, err)
}
