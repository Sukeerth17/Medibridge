package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"Medibridge/go-api/handlers"
	"Medibridge/go-api/utils"
)

const (
	RolePatient  = "Patient"
	RoleClinic   = "Clinic"
	RoleScanning = "Scanning"
)

func main() {
	// 0. Initialize Database Connection FIRST
	log.Println("Initializing database connection...")
	if err := utils.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer utils.CloseDatabase()

	// 1. Initialize gRPC Client Connection to the Python AI Microservice
	go func() {
		time.Sleep(2 * time.Second)
		utils.InitGRPCClient()
	}()
	defer utils.CloseGRPCClient()

	// 2. Initialize the Gin router
	router := gin.Default()

	// Enable CORS for frontend apps
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 3. Public Routes
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "MediBridge API is running",
			"version": "1.0.0",
		})
	})

	router.GET("/v1/status", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "MediBridge Go API is running successfully!",
			"timestamp": time.Now().Unix(),
		})
	})

	// Health check for Docker
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	// Auth routes
	authGroup := router.Group("/v1/auth")
	{
		authGroup.POST("/login", handlers.LoginHandler)
	}

	// 4. Protected Routes
	protected := router.Group("/v1", handlers.AuthMiddleware())

	// Patient Routes
	patientGroup := protected.Group("/patient", handlers.RBACMiddleware(RolePatient))
	{
		patientGroup.GET("/prescriptions", handlers.GetPatientPrescriptions)
		patientGroup.POST("/adherence", handlers.LogAdherence)
		patientGroup.GET("/reports", handlers.GetPatientReports)
	}

	// Chatbot Route
	chatbotGroup := protected.Group("/chatbot", handlers.RBACMiddleware(RolePatient))
	{
		chatbotGroup.POST("/query", handlers.ChatbotQueryHandler)
	}

	// Clinic Routes
	clinicGroup := protected.Group("/clinic", handlers.RBACMiddleware(RoleClinic))
	{
		clinicGroup.POST("/prescriptions/new", handlers.CreateNewPrescription)
		clinicGroup.GET("/patients/search", handlers.SearchPatients)
		clinicGroup.GET("/patients/:id/full", handlers.GetPatientFullRecord)
	}

	// Scanning Routes
	scanningGroup := protected.Group("/scanning", handlers.RBACMiddleware(RoleScanning))
	{
		scanningGroup.POST("/reports/upload", handlers.UploadTechnicalReport)
		scanningGroup.POST("/reports/:id/finalize", handlers.FinalizeAndShareReport)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := "0.0.0.0:" + port
	log.Printf("Starting MediBridge Go API server on %s...", addr)

	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}