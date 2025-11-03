package handlers

import (
	"database/sql"
	"net/http"
	"github.com/gin-gonic/gin"
	"Medibridge/go-api/models"
	"Medibridge/go-api/utils"
)

func LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Query the database for the user
	var user models.User
	query := `
		SELECT unique_user_id, name, role, hashed_password 
		FROM users 
		WHERE mobile_number = $1
	`
	
	err := utils.DB.QueryRow(query, req.Mobile).Scan(
		&user.ID,
		&user.Name,
		&user.Role,
		&user.Password,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid mobile number or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify password (in production, use bcrypt.CompareHashAndPassword)
	// For now, we're comparing plain text as per init.sql
	if user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid mobile number or password"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate authentication token"})
		return
	}

	response := models.LoginResponse{
		Token: token,
		Role:  user.Role,
	}
	c.JSON(http.StatusOK, response)
}