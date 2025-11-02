package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"Medibridge/go-api/utils"
	"Medibridge/go-api/models"
)

// GetPatientPrescriptions handles GET /v1/patient/prescriptions
// Retrieves personalized prescriptions for the authenticated user (DB Scoping).
func GetPatientPrescriptions(c *gin.Context) {
	userID := c.GetString("userID")
	// TODO: Add PostgreSQL query logic to fetch prescriptions for userID.
	// NOTE: Data fetched from DB must be Decrypted using utils.Decrypt.

	c.JSON(http.StatusOK, gin.H{
		"message": "Prescriptions retrieved successfully.",
		"user_id": userID,
		"data_scope": "Records filtered by authenticated user ID",
	})
}

// GetPatientReports handles GET /v1/patient/reports
// Retrieves AI-simplified reports for the authenticated user.
func GetPatientReports(c *gin.Context) {
	userID := c.GetString("userID")
	// TODO: Add PostgreSQL query logic to fetch reports for userID.

	c.JSON(http.StatusOK, gin.H{
		"message": "Simplified reports loaded successfully.",
		"user_id": userID,
	})
}

// LogAdherence handles POST /v1/patient/adherence
// Logs the adherence timestamp.
func LogAdherence(c *gin.Context) {
	userID := c.GetString("userID")
	var adherence models.AdherenceRequest
	
	if err := c.ShouldBindJSON(&adherence); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid adherence data format"})
		return
	}

	// TODO: Add PostgreSQL INSERT into the adherence table using userID and adherence data.

	c.JSON(http.StatusOK, gin.H{
		"message": "Adherence logged successfully.",
		"user_id": userID,
		"prescription_id": adherence.PrescriptionID,
	})
}

// ChatbotQueryHandler handles POST /v1/chatbot/query
// Relays the user query to the Python AI service via gRPC.
func ChatbotQueryHandler(c *gin.Context) {
	userID := c.GetString("userID")
	var req struct{ Query string `json:"query" binding:"required"` }
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query required"})
		return
	}

	// Go backend relays this request to the Python AI service (gRPC).
	response, err := utils.QueryChatbot(req.Query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Chatbot service failed or timed out"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"query": req.Query,
		"response": response,
	})
}
