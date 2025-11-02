package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/MediBridge/go-api/handlers"
	"github.com/MediBridge/go-api/utils"
)

// Define the User Roles as constants
const (
	RolePatient  = "Patient"
	RoleClinic   = "Clinic"
	RoleScanning = "Scanning"
)

func main() {
    // 1. Initialize gRPC Client Connection
    // The Go API connects to the Python AI Microservice via gRPC at startup.
    utils.InitGRPCClient()
    defer utils.CloseGRPCClient() // Ensure the connection is closed when the server shuts down

	// 2. Initialize the Gin router
	router := gin.Default()

	// 3. --- Public Routes (No Auth Required) ---
	router.GET("/v1/status", func(c *gin.Context) {
		// Checks the status of the Go API itself
		c.JSON(http.StatusOK, gin.H{"status": "MediBridge Go API is running successfully!"})
	})
    
	// All users log in here to receive their JWT token
	authGroup := router.Group("/v1/auth")
	{
		authGroup.POST("/login", handlers.LoginHandler) // Uses the handler defined earlier
	}

	// 4. --- Protected Routes (Requires AuthMiddleware) ---
	// All subsequent groups will use the AuthMiddleware to validate the JWT.
	protected := router.Group("/v1", handlers.AuthMiddleware())

    // --- 5. Role-Specific Groups (Requires RBAC Middleware) ---
    
    // PATIENT APP Routes (Accessibility & Control)
	patientGroup := protected.Group("/patient", handlers.RBACMiddleware(RolePatient))
	{
        [cite_start]// /v1/patient/prescriptions: GET request to retrieve personalized dashboard data [cite: 43]
		patientGroup.GET("/prescriptions", handlers.GetPatientPrescriptions) 
        [cite_start]// /v1/patient/adherence: POST request to log dose adherence [cite: 53]
		patientGroup.POST("/adherence", handlers.LogAdherence)
        [cite_start]// /v1/patient/reports: GET request to retrieve simplified reports [cite: 43]
		patientGroup.GET("/reports", handlers.GetPatientReports)
	}

    // CLINIC APP Routes (Efficiency & Digitalization)
	clinicGroup := protected.Group("/clinic", handlers.RBACMiddleware(RoleClinic))
	{
        [cite_start]// /v1/clinic/prescriptions/new: POST request to submit a new structured prescription [cite: 69]
		clinicGroup.POST("/prescriptions/new", handlers.CreateNewPrescription)
        [cite_start]// /v1/clinic/patients/search: GET request to lookup a patient via ID or name [cite: 62]
		clinicGroup.GET("/patients/search", handlers.SearchPatients)
        [cite_start]// /v1/clinic/patients/{patient_id}/full: GET request for professional-grade history [cite: 72]
		clinicGroup.GET("/patients/:id/full", handlers.GetPatientFullRecord) 
	}
    
    // SCANNING CENTER APP Routes (Data Flow & Automation)
	scanningGroup := protected.Group("/scanning", handlers.RBACMiddleware(RoleScanning))
	{
        [cite_start]// /v1/scanning/reports/upload: POST request to upload the original technical report [cite: 79]
		scanningGroup.POST("/reports/upload", handlers.UploadTechnicalReport)
        [cite_start]// /v1/scanning/reports/{report_id}/finalize: POST request to trigger multi-party sharing [cite: 84]
		scanningGroup.POST("/reports/:id/finalize", handlers.FinalizeAndShareReport)
	}

	// Start the HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting MediBridge Go API server on port :%s...", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}

// --- Placeholder Handler Definitions for main.go to compile ---

func GetPatientPrescriptions(c *gin.Context) { 
	userID := c.GetString("userID")
	[cite_start]// The Go backend authenticates the token and filters the PostgreSQL database to return only records linked to the patient's unique ID[cite: 44].
	c.JSON(http.StatusOK, gin.H{"message": "Retrieving prescriptions for patient: " + userID + " (DB Scoping)"})
}
func LogAdherence(c *gin.Context) { 
	userID := c.GetString("userID")
	[cite_start]// Sends a POST request to /v1/patient/adherence, logging the adherence timestamp[cite: 53].
	c.JSON(http.StatusOK, gin.H{"message": "Adherence logged for user: " + userID}) 
}
func GetPatientReports(c *gin.Context) { 
	userID := c.GetString("userID")
	c.JSON(http.StatusOK, gin.H{"message": "Retrieving reports for patient: " + userID + " (AI-Simplified)"}) 
}
func CreateNewPrescription(c *gin.Context) {
    [cite_start]// Triggers internal call to Python AI Service for translation and audio[cite: 70].
	c.JSON(http.StatusOK, gin.H{"message": "New prescription submitted and AI processing triggered."}) 
}
func SearchPatients(c *gin.Context) { 
	[cite_start]// Guards the search endpoint with the CLINIC role check[cite: 63].
	c.JSON(http.StatusOK, gin.H{"message": "Searching patient database (CLINIC Role Guarded)"})
}
func GetPatientFullRecord(c *gin.Context) {
    [cite_start]// This endpoint is guarded by the CLINIC role check[cite: 73].
	c.JSON(http.StatusOK, gin.H{"message": "Retrieving full professional record for patient ID: " + c.Param("id")})
}
func UploadTechnicalReport(c *gin.Context) {
    [cite_start]// Triggers gRPC call to Python AI Service for text extraction and simplification[cite: 120].
	c.JSON(http.StatusOK, gin.H{"message": "Technical Report uploaded. AI processing initiated via gRPC."})
}
func FinalizeAndShareReport(c *gin.Context) {
    [cite_start]// Triggers multi-party sharing logic (Patient gets Simplified, Clinic gets Technical)[cite: 85, 86].
	c.JSON(http.StatusOK, gin.H{"message": "Report Finalized. Shared to Patient and Referring Clinic."})
}