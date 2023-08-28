package response

import "net/http"

type Error struct {
	StatusCode int    `json:"-"`
	Message    string `json:"message"`
}

func BadRequestError(message string) Error {
	return Error{
		StatusCode: http.StatusBadRequest,
		Message:    message,
	}
}

func UnauthorizedError(message string) Error {
	return Error{
		StatusCode: http.StatusUnauthorized,
		Message:    message,
	}
}

func NotFoundError(message string) Error {
	return Error{
		StatusCode: http.StatusNotFound,
		Message:    message,
	}
}

func InternalServerError() Error {
	return Error{
		StatusCode: http.StatusInternalServerError,
		Message:    "Internal Server Error",
	}
}
