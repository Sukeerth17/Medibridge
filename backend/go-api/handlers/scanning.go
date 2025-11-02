package handlers

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"Medibridge/go-api/utils"
)

// UploadTechnicalReport handles POST /v1/scanning/reports/upload
// Receives the original technical report file and metadata.
func UploadTechnicalReport(c *gin.Context) {
	scanningID := c.GetString("userID")
	
	// 1. Receive file and metadata (Patient ID, Type of Scan, Referring Doctor).
	_, err := c.FormFile("report_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Report file required in form data"})
		return
	}
	// TODO: Securely save the file, update DB with file URL and metadata.
	
	reportID := "RPT_mock_" + time.Now().Format("060102150405")

	// 2. Trigger internal gRPC call to Python AI Microservice.
	if err := utils.TriggerReportProcessing(reportID, nil /* file data */); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Report saved, but AI processing trigger failed."})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Original Technical Report uploaded. AI processing initiated via gRPC.",
		"report_id": reportID,
		"scanning_center": scanningID,
	})
}

// FinalizeAndShareReport handles POST /v1/scanning/reports/:id/finalize
// Triggers the critical multi-party sharing action.
func FinalizeAndShareReport(c *gin.Context) {
	reportID := c.Param("id")
	
	// The Go API executes the multi-party sharing logic:
	// 1. Push the Simplified Report to the Patient App.
	// 2. Push the Original Technical Report to the referring Clinic App.
	
	// TODO: Implement PostgreSQL logic to update the report status to "Shared" and link the report to the appropriate Patient/Clinic IDs.

	c.JSON(http.StatusOK, gin.H{
		"message": "Report finalized and multi-party sharing executed successfully.",
		"report_id": reportID,
	})
}
