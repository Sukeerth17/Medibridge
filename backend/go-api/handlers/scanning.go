package handlers

import (
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/MediBridge/go-api/utils"
)

// UploadTechnicalReport handles POST /v1/scanning/reports/upload
// Receives the original technical report file and metadata.
func UploadTechnicalReport(c *gin.Context) {
	scanningID := c.GetString("userID")
	
	[cite_start]// 1. Receive file and metadata (Patient ID, Type of Scan, Referring Doctor)[cite: 88].
	file, _ := c.FormFile("report_file")
	// TODO: Save the original file securely (e.g., to a cloud storage and save URL in DB).
	
	reportID := "RPT_mock_" + time.Now().Format("060102150405")

	[cite_start]// 2. Upon receiving the upload, the Go backend immediately makes an internal gRPC call to the Python AI Microservice[cite: 90].
	if err := utils.TriggerReportProcessing(reportID, nil /* file data */); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Report saved, but AI processing trigger failed."})
		return
	}

	[cite_start]// 3. Update status in the DB (e.g., to "AI Processing")[cite: 93].
	
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
	
	// This single API call triggers the Go backend to simultaneously:
	
	[cite_start]// 1. Push the Simplified Report to the Patient App (via their unique ID)[cite: 95].
	[cite_start]// 2. Push the Original Technical Report to the referring Clinic App (via the Clinic ID)[cite: 96].
	
	[cite_start]// The communication loop is closed, delivering the correct version of the report to each recipient[cite: 134].
	
	// TODO: Implement PostgreSQL logic to update the report status to "Shared" and link the report to the appropriate Patient/Clinic IDs.

	c.JSON(http.StatusOK, gin.H{
		"message": "Report finalized and multi-party sharing executed successfully.",
		"report_id": reportID,
	})
}