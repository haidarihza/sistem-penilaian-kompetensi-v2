package auth

import (
	"database/sql"
	"encoding/json"
	"errors"
	"interview/summarization/app/response"
	"interview/summarization/repository"
	"interview/summarization/token"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type (
	LoginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	Token struct {
		Token     string `json:"token"`
		Scheme    string `json:"scheme"`
		ExpiresAt string `json:"expires_at"`
	}

	LoginResponse struct {
		AccessToken  Token  `json:"access_token"`
		RefreshToken Token  `json:"refresh_token"`
		Role         string `json:"role"`
	}
)

func Login(userRepository repository.UserRepository, jwt token.JWT) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := LoginRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		user, err := userRepository.SelectIDPasswordRoleByEmail(r.Context(), req.Email)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				response.RespondError(w, response.UnauthorizedError("Invalid credentials"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			response.RespondError(w, response.UnauthorizedError("Invalid credentials"))
			return
		}

		status, ok := repository.UserStatusMapper(string(user.Status))
		if !ok {
			response.RespondError(w, response.InternalServerError())
			return
		}
		if status != repository.Veryfied {
			response.RespondError(w, response.UnauthorizedError("User is not verified"))
			return
		}

		atClaim := token.JWTClaim{
			UserID: user.ID,
			Role:   string(user.Role),
		}
		accessToken, err := jwt.CreateAccessToken(atClaim)

		rtClaim := token.JWTClaim{
			UserID: user.ID,
		}
		refreshToken, err := jwt.CreateRefreshToken(rtClaim)

		response.Respond(w, http.StatusOK, LoginResponse{
			AccessToken: Token{
				Token:     accessToken.Token,
				Scheme:    accessToken.Scheme,
				ExpiresAt: accessToken.ExpiresAt.Format(time.RFC3339),
			},
			RefreshToken: Token{
				Token:     refreshToken.Token,
				Scheme:    refreshToken.Scheme,
				ExpiresAt: refreshToken.ExpiresAt.Format(time.RFC3339),
			},
			Role: string(user.Role),
		})
	}
}
