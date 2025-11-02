package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/MediBridge/go-api/handlers"
	"github.com/MediBridge/go-api/utils"
)

// Define the User Roles as constants for RBAC
const (
	RolePatient  = "Patient"
	RoleClinic   = "Clinic"
	RoleScanning = "Scanning"
)

func main() {
	// 1. Initialize gRPC Client Connection to the Python AI Microservice
	utils.InitGRPCClient()
	defer utils.CloseGRPCClient() 

	// 2. Initialize the Gin router
	router := gin.Default()

	// 3. --- Public Routes (No Auth Required) ---
	router.GET("/v1/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "MediBridge Go API is running successfully!"})
	})
	
	// All users log in here to receive their JWT token
	authGroup := router.Group("/v1/auth")
	{
		authGroup.POST("/login", handlers.LoginHandler) 
	}

	// 4. --- Protected Routes (Requires AuthMiddleware) ---
	protected := router.Group("/v1", handlers.AuthMiddleware())

	// --- 5. Role-Specific Groups (Requires RBAC Middleware) ---
	
	// PATIENT APP Routes (Accessibility & Control)
	patientGroup := protected.Group("/patient", handlers.RBACMiddleware(RolePatient))
	{
		// /v1/patient/prescriptions: GET request to retrieve personalized dashboard data
		patientGroup.GET("/prescriptions", handlers.GetPatientPrescriptions) 
		// /v1/patient/adherence: POST request to log dose adherence
		patientGroup.POST("/adherence", handlers.LogAdherence)
		// /v1/patient/reports: GET request to retrieve simplified reports
		patientGroup.GET("/reports", handlers.GetPatientReports)
	}

	// CHATBOT Route (Accessible by Patient Role)
    // The chatbot is isolated as a group because it triggers a separate gRPC call.
	chatbotGroup := protected.Group("/chatbot", handlers.RBACMiddleware(RolePatient))
	{
		// /v1/chatbot/query: POST request for conversational AI interface
		chatbotGroup.POST("/query", handlers.ChatbotQueryHandler) 
	}


	// CLINIC APP Routes (Efficiency & Digitalization)
	clinicGroup := protected.Group("/clinic", handlers.RBACMiddleware(RoleClinic))
	{
		// /v1/clinic/prescriptions/new: POST request to submit a new structured prescription
		clinicGroup.POST("/prescriptions/new", handlers.CreateNewPrescription)
		// /v1/clinic/patients/search: GET request to lookup a patient via ID or name
		clinicGroup.GET("/patients/search", handlers.SearchPatients)
		// /v1/clinic/patients/:id/full: GET request for professional-grade history
		clinicGroup.GET("/patients/:id/full", handlers.GetPatientFullRecord) 
	}
	
	// SCANNING CENTER APP Routes (Data Flow & Automation)
	scanningGroup := protected.Group("/scanning", handlers.RBACMiddleware(RoleScanning))
	{
		// /v1/scanning/reports/upload: POST request to upload the original technical report
		scanningGroup.POST("/reports/upload", handlers.UploadTechnicalReport)
		// /v1/scanning/reports/:id/finalize: POST request to trigger multi-party sharing
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
