package models

// User represents a user in the MediBridge system.
type User struct {
	ID       string `json:"id"`        // Unique ID (UUID or Unique Patient ID)
	Mobile   string `json:"mobile"`    // Registered mobile number for OTP access
	Password string `json:"password"`  // Hashed password (or used for initial OTP validation)
	Name     string `json:"name"`
	Role     string `json:"role"`      // Crucial for RBAC: "Patient", "Clinic", or "Scanning" 
}

// LoginRequest defines the structure for an incoming login request (Mobile/Password/OTP)
type LoginRequest struct {
	Mobile   string `json:"mobile" binding:"required"`
	Password string `json:"password" binding:"required"` // Could be a static password or OTP
}

// LoginResponse defines the structure for the successful login response
type LoginResponse struct {
	Token string `json:"token"` // The JWT token [cite: 42]
	Role  string `json:"role"`  // The user's confirmed role 
}