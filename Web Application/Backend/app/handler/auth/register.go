package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"interview/summarization/app/response"
	"interview/summarization/config"
	"interview/summarization/repository"
	"interview/summarization/token"
	"net/http"
	"net/smtp"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func Register(userRepository repository.UserRepository, jwt token.JWT, cfg config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		req := RegisterRequest{}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			response.RespondError(w, response.BadRequestError("Incorrect Payload Format"))
			return
		}

		role, ok := repository.UserRoleMapper(req.Role)
		if !ok {
			response.RespondError(w, response.BadRequestError("Invalid Role"))
			return
		}

		hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			response.RespondError(w, response.InternalServerError())
			return
		}

		newUser := &repository.User{
			ID:       uuid.NewString(),
			Name:     req.Name,
			Phone:    req.Phone,
			Email:    req.Email,
			Password: string(hashedPass),
			Role:     role,
		}

		go func(ctx context.Context, userID, receiver string, jwt token.JWT) {
			auth := smtp.PlainAuth(cfg.SenderIdentity, cfg.SenderEmail, cfg.SenderPassword, cfg.AddressHost)

			token, _ := jwt.CreateAccessToken(token.JWTClaim{
				UserID: userID,
			})

			urlverify := fmt.Sprintf("%s/auth/verify?token=%s", cfg.APIHost, token.Token)
			body := []byte(fmt.Sprintf("Thank you for registering to Hiremif. Click the link to verify your email: %s", urlverify))

			content := "Subject: Email Verification Hiremif" + "\n\n" + string(body)

			smtp.SendMail(fmt.Sprintf("%s:%d", cfg.AddressHost, cfg.AddressPort), auth, cfg.SenderEmail, []string{receiver}, []byte(content))
		}(context.Background(), newUser.ID, req.Email, jwt)

		if err := userRepository.Insert(r.Context(), newUser); err != nil {
			if strings.Contains(err.Error(), "unique constraint") {
				response.RespondError(w, response.UnauthorizedError("Invalid credentials"))
				return
			}

			response.RespondError(w, response.InternalServerError())
			return
		}

		response.RespondOK(w)
	}
}
