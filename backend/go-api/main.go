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
	RoleAdmin    = "Admin"
)

func main() {
	// 0. Initialize Database Connection FIRST
	log.Println("Initializing database connection...")
	if err := utils.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer utils.CloseDatabase()

	// Load drugs from CSV
	log.Println("Loading drug database from CSV...")
	if err := handlers.LoadDrugsFromCSV(); err != nil {
		log.Printf("Warning: Failed to load drugs from CSV: %v", err)
	}

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
			"endpoints": gin.H{
				"health": "GET /health",
				"status": "GET /v1/status",
				"auth": gin.H{
					"login": "POST /v1/auth/login",
					"otp_request": "POST /v1/auth/otp/request",
					"otp_verify": "POST /v1/auth/otp/verify",
				},
			},
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
		authGroup.POST("/otp/request", handlers.RequestOTP)
		authGroup.POST("/otp/verify", handlers.VerifyOTP)
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

	// Clinic Routes (NO RBAC - Allow any authenticated user to access for demo)
	clinicGroup := protected.Group("/clinic")
	{
		clinicGroup.POST("/prescriptions/new", handlers.CreateNewPrescription)
		clinicGroup.GET("/patients/search", handlers.SearchPatients)
		clinicGroup.GET("/patients/:id/full", handlers.GetPatientFullRecord)
		
		// Drug database routes (public for clinic app)
		clinicGroup.GET("/drugs", handlers.GetDrugDatabase)
		clinicGroup.GET("/drugs/search", handlers.SearchDrugs)
	}

	// Scanning Routes
	scanningGroup := protected.Group("/scanning", handlers.RBACMiddleware(RoleScanning))
	{
		scanningGroup.POST("/reports/upload", handlers.UploadTechnicalReport)
		scanningGroup.POST("/reports/:id/finalize", handlers.FinalizeAndShareReport)
	}

	// Admin Routes (for CSV upload)
	adminGroup := protected.Group("/admin", handlers.RBACMiddleware(RoleAdmin, RoleClinic))
	{
		adminGroup.POST("/drugs/upload", handlers.UploadDrugCSV)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := "0.0.0.0:" + port
	log.Printf("\n🚀 Starting MediBridge Go API server on %s...\n", addr)
	log.Printf("📍 Access at: http://localhost:%s\n", port)
	log.Printf("🏥 Clinic App: http://localhost:3001\n")
	log.Printf("👤 Patient App: http://localhost:3000\n")
	log.Printf("🔬 Scanning App: http://localhost:3002\n\n")

	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}