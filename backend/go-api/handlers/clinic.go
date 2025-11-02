package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"Medibridge/go-api/models"
	"Medibridge/go-api/utils"
)

// CreateNewPrescription handles POST /v1/clinic/prescriptions/new
// Receives structured data, saves it, and triggers AI processing.
func CreateNewPrescription(c *gin.Context) {
	clinicID := c.GetString("userID")
	var prescriptionData models.Prescription
	
	if err := c.ShouldBindJSON(&prescriptionData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid prescription data format"})
		return
	}

	// 1. Save the structured data to PostgreSQL.
	prescriptionData.ClinicID = clinicID
	// TODO: Add PostgreSQL INSERT logic, ensuring sensitive patient data is Encrypted (utils.Encrypt).
	
	// 2. Trigger internal gRPC call to Python AI Service for translation and audio generation.
	if err := utils.TriggerTranslationAndAudio(prescriptionData); err != nil {
		// Log error but may return 202 Accepted if saving the original record succeeded
		c.JSON(http.StatusAccepted, gin.H{"message": "Prescription saved, but AI translation failed. Check AI Service logs."}) 
		return
	}

	// 3. This action immediately pushes the complete digital prescription to the Patient App.
	c.JSON(http.StatusOK, gin.H{"message": "Prescription created, saved, and AI processing triggered successfully."})
}

// SearchPatients handles GET /v1/clinic/patients/search
// Allows clinic staff to quickly look up any patient.
func SearchPatients(c *gin.Context) {
	// Go backend ensures the user is a CLINIC role before executing the search against the database.
	query := c.Query("q")
	
	// TODO: Add PostgreSQL search/filter logic (restricted to patient/user data visible to clinics).
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Patient search executed (CLINIC role check passed).",
		"query": query,
		"results": []string{"PAT001 - A. Patient", "PAT002 - B. Patient"},
	})
}

// GetPatientFullRecord handles GET /v1/clinic/patients/:id/full
// Returns all professional-grade data, including original reports and detailed notes.
func GetPatientFullRecord(c *gin.Context) {
	patientID := c.Param("id")
	
	// This endpoint is guarded by the CLINIC role check (via middleware).
	// TODO: Add complex query to fetch all prescription, report, and note data for the patient ID.

	c.JSON(http.StatusOK, gin.H{
		"message": "Full professional record retrieved.",
		"patient_id": patientID,
		"access_level": "Professional/Clinic",
	})
}
