package models

// User represents a user in the MediBridge system.
type User struct {
	ID       string `json:"id"`        // Unique ID (UUID or Unique Patient ID)
	Mobile   string `json:"mobile"`    // Registered mobile number
	Password string `json:"password"`  // Hashed password
	Name     string `json:"name"`
	Role     string `json:"role"`      // Crucial for RBAC: "Patient", "Clinic", or "Scanning"
}

// LoginRequest defines the structure for an incoming login request.
type LoginRequest struct {
	Mobile   string `json:"mobile" binding:"required"`
	Password string `json:"password" binding:"required"` 
}

// LoginResponse defines the structure for the successful login response
type LoginResponse struct {
	Token string `json:"token"` // The JWT token
	Role  string `json:"role"`  // The user's confirmed role
}
