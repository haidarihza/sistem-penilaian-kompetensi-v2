package token

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWT interface {
	CreateAccessToken(JWTClaim) (*JWTToken, error)
	CreateRefreshToken(JWTClaim) (*JWTToken, error)
	GetClaims(token string) (*JWTClaim, error)
}

type JWTClaim struct {
	jwt.RegisteredClaims
	UserID string `json:"user_id,omitempty"`
	Role   string `json:"role,omitempty"`
}

type JWTToken struct {
	Token     string
	Claim     JWTClaim
	ExpiresAt time.Time
	Scheme    string
}
