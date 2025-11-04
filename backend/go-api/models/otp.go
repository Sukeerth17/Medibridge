package models

import "time"

// OTPRequest defines the structure for OTP request
type OTPRequest struct {
	Phone string `json:"phone" binding:"required"`
	Role  string `json:"role" binding:"required"` // Patient, Clinic, or Scanning
}

// OTPVerifyRequest defines the structure for OTP verification
type OTPVerifyRequest struct {
	Phone string `json:"phone" binding:"required"`
	OTP   string `json:"otp" binding:"required"`
	Role  string `json:"role" binding:"required"`
}

// OTPData stores OTP with expiry time
type OTPData struct {
	OTP       string
	ExpiresAt time.Time
}