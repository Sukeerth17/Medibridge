package utils

import (
	"time"
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// Define the JWT secret key (loaded from .env via environment variable)
// NOTE: This variable is initialized when the program starts.
var jwtSecretKey = []byte(os.Getenv("JWT_SECRET"))

// Claims structure for the JWT
type CustomClaims struct {
	ID   string `json:"id"`
	Role string `json:"role"` // "Patient", "Clinic", or "Scanning"
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT for a user
func GenerateToken(userID string, userRole string) (string, error) {
	if len(jwtSecretKey) == 0 {
		return "", fmt.Errorf("JWT_SECRET not configured")
	}
	expirationTime := time.Now().Add(24 * time.Hour) 

	claims := &CustomClaims{
		ID:   userID,
		Role: userRole,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecretKey)
	
	if err != nil {
		return "", fmt.Errorf("could not sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken parses and validates the JWT, returning the claims if successful
func ValidateToken(tokenString string) (*CustomClaims, error) {
	claims := &CustomClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Method)
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}
