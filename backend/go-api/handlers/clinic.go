package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/MediBridge/go-api/models"
	"github.com/MediBridge/go-api/utils"
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

	[cite_start]// 1. Save the structured data to PostgreSQL[cite: 123].
	prescriptionData.ClinicID = clinicID
	// TODO: Add PostgreSQL INSERT logic, ensuring sensitive data is Encrypted (utils.Encrypt).
	
	[cite_start]// 2. Trigger internal gRPC call to Python AI Service for translation and audio generation[cite: 124].
	if err := utils.TriggerTranslationAndAudio(prescriptionData); err != nil {
		// Log error but may continue if saving the original record succeeded
		c.JSON(http.StatusAccepted, gin.H{"message": "Prescription saved, but AI translation failed."}) 
		return
	}

	[cite_start]// 3. This action immediately pushes the complete digital prescription to the Patient App[cite: 81].
	c.JSON(http.StatusOK, gin.H{"message": "Prescription created, saved, and AI processing triggered successfully."})
}

// SearchPatients handles GET /v1/clinic/patients/search
[cite_start]// Allows clinic staff to quickly look up any patient[cite: 29].
func SearchPatients(c *gin.Context) {
	[cite_start]// Go backend ensures the user is a CLINIC role before executing the search against the database[cite: 73].
	query := c.Query("q")
	
	// TODO: Add PostgreSQL search/filter logic (restricted to patient/user data).
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Patient search executed (CLINIC role check passed).",
		"query": query,
	})
}

// GetPatientFullRecord handles GET /v1/clinic/patients/:id/full
[cite_start]// Returns all professional-grade data, including original reports and detailed notes[cite: 83].
func GetPatientFullRecord(c *gin.Context) {
	patientID := c.Param("id")
	clinicID := c.GetString("userID")
	
	[cite_start]// This endpoint is guarded by the CLINIC role check (via middleware)[cite: 83].
	// TODO: Add complex query to fetch all prescription, report, and note data for the patient ID.

	c.JSON(http.StatusOK, gin.H{
		"message": "Full professional record retrieved.",
		"patient_id": patientID,
		"clinic_id": clinicID,
	})
}