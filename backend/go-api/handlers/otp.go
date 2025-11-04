package handlers

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"Medibridge/go-api/models"
	"Medibridge/go-api/utils"
)

// In-memory OTP storage (for demo - use Redis in production)
var otpStore = make(map[string]models.OTPData)

// RequestOTP generates and stores OTP for phone number
func RequestOTP(c *gin.Context) {
	var req models.OTPRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Verify user exists with this role
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE mobile_number = $1 AND role = $2)`
	err := utils.DB.QueryRow(query, req.Phone, req.Role).Scan(&exists)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found with specified role"})
		return
	}

	// Generate 6-digit OTP
	rand.Seed(time.Now().UnixNano())
	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Store OTP with expiry (5 minutes)
	otpStore[req.Phone] = models.OTPData{
		OTP:       otp,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}

	// In production: Send SMS via Twilio/AWS SNS
	// For demo: Log to console
	fmt.Printf("OTP for %s: %s\n", req.Phone, otp)

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP sent successfully",
		"otp": otp, // Remove in production!
	})
}

// VerifyOTP verifies OTP and returns JWT token
func VerifyOTP(c *gin.Context) {
	var req models.OTPVerifyRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Check OTP
	storedData, exists := otpStore[req.Phone]
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No OTP found for this number"})
		return
	}

	// Check expiry
	if time.Now().After(storedData.ExpiresAt) {
		delete(otpStore, req.Phone)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "OTP expired"})
		return
	}

	// Verify OTP
	if storedData.OTP != req.OTP {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid OTP"})
		return
	}

	// Delete used OTP
	delete(otpStore, req.Phone)

	// Get user details
	var user models.User
	query := `
		SELECT unique_user_id, name, role 
		FROM users 
		WHERE mobile_number = $1 AND role = $2
	`
	
	err := utils.DB.QueryRow(query, req.Phone, req.Role).Scan(
		&user.ID,
		&user.Name,
		&user.Role,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"role":  user.Role,
		"name":  user.Name,
	})
}