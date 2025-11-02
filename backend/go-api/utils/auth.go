package utils

import (
	"time"
    "fmt"
	"github.com/golang-jwt/jwt/v5"
    "github.com/MediBridge/go-api/models" // Assuming you've created the models package
)

// NOTE: In a real application, SECRET_KEY should be loaded securely from .env
// We'll use a placeholder here as per the plan to use .env [cite: 126]
var jwtSecretKey = []byte("your_secure_jwt_secret_key_from_env")

// Claims structure for the JWT
type CustomClaims struct {
	ID   string `json:"id"`
	Role string `json:"role"` // "Patient", "Clinic", or "Scanning" [cite: 106]
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT for a user
func GenerateToken(userID string, userRole string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // Token valid for 24 hours

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
		// Verify the signing method
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