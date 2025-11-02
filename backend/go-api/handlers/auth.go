package handlers

import (
	"net/http"
	"time" // Used for a simulated DB lookup delay

	"github.com/gin-gonic/gin"
	"github.com/MediBridge/go-api/models"
	"github.com/MediBridge/go-api/utils"
)

// LoginHandler handles POST requests to /v1/auth/login
// It performs user validation and issues a JWT token.
func LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	
    // 1. Bind the JSON request body to the LoginRequest struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// --- 2. Database Lookup and Credential Validation (SIMULATION) ---
	// In a real system, you would query the PostgreSQL database here 
	// (e.g., SELECT id, role, password_hash FROM users WHERE mobile = $1)
	
	// Simulate a database query delay
	time.Sleep(50 * time.Millisecond) 

	// For demonstration, use a fixed mapping based on credentials:
	var user models.User
	
    if req.Mobile == "9876543210" && req.Password == "patientpass" {
		user = models.User{ID: "PAT001", Role: "Patient", Name: "A. Patient"} // Role: Patient [cite: 116]
	} else if req.Mobile == "1122334455" && req.Password == "clinicpass" {
		user = models.User{ID: "CLI002", Role: "Clinic", Name: "Dr. Admin"} // Role: Clinic [cite: 70, 116]
	} else if req.Mobile == "9988776655" && req.Password == "scanpass" {
		user = models.User{ID: "SCN003", Role: "Scanning", Name: "Tech Alpha"} // Role: Scanning [cite: 85, 116]
	} else {
		// 3. Failure: Invalid credentials
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid mobile number or password"})
		return
	}

	// --- 4. JWT Generation ---
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate authentication token"})
		return
	}

	// 5. Success: Return the token and the user's role
	response := models.LoginResponse{
		Token: token,
		Role:  user.Role,
	}
    // The app securely stores the returned JWT token and the user's role [cite: 52]
	c.JSON(http.StatusOK, response)
}