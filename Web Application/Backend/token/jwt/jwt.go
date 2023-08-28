package jwt

import (
	"fmt"
	"interview/summarization/config"
	"interview/summarization/token"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type jwtImpl struct {
	cfg config.Config
}

func NewJWT(cfg config.Config) token.JWT {
	j := &jwtImpl{
		cfg: cfg,
	}

	return j
}

func (j *jwtImpl) signToken(claim *token.JWTClaim) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)

	tokenString, err := token.SignedString([]byte(j.cfg.TokenSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (j *jwtImpl) CreateAccessToken(claim token.JWTClaim) (*token.JWTToken, error) {
	now := time.Now()
	expAt := now.Add(time.Duration(j.cfg.AccessTokenExpire) * time.Minute)

	registeredClaims := jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expAt),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	claim.RegisteredClaims = registeredClaims

	signedToken, err := j.signToken(&claim)
	if err != nil {
		return nil, fmt.Errorf("Error creating access token: %w", err)
	}

	jwtToken := &token.JWTToken{
		Token:     signedToken,
		Claim:     claim,
		ExpiresAt: expAt,
		Scheme:    "Bearer",
	}

	return jwtToken, nil
}

func (j *jwtImpl) CreateRefreshToken(claim token.JWTClaim) (*token.JWTToken, error) {
	now := time.Now()
	expAt := now.Add(time.Duration(j.cfg.RefreshTokenExpire) * time.Hour)

	registeredClaims := jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(expAt),
		IssuedAt:  jwt.NewNumericDate(now),
	}
	claim.RegisteredClaims = registeredClaims

	signedToken, err := j.signToken(&claim)
	if err != nil {
		return nil, fmt.Errorf("Error creating refresh token: %w", err)
	}

	jwtToken := &token.JWTToken{
		Token:     signedToken,
		Claim:     claim,
		ExpiresAt: expAt,
		Scheme:    "Bearer",
	}

	return jwtToken, nil
}

func (j *jwtImpl) GetClaims(tokenString string) (*token.JWTClaim, error) {
	claim := &token.JWTClaim{}
	_, err := jwt.ParseWithClaims(tokenString, claim, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(j.cfg.TokenSecret), nil
	})

	if err != nil {
		return nil, err
	}

	return claim, nil
}
