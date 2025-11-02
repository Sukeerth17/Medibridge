package utils

import (
	"context"
	"log"
	"os"
	"time"

	// Fixed import path with capital M
	"Medibridge/go-api/models"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// AIClientConn stores the connection object to the Python AI Microservice
var AIClientConn *grpc.ClientConn

// InitGRPCClient establishes the connection to the Python AI Microservice.
func InitGRPCClient() {
	// Reference the Python AI service by its Docker service name 'ai-service'
	aiServiceHost := os.Getenv("AI_SERVICE_HOST")
	if aiServiceHost == "" {
		aiServiceHost = "ai-service:50051" // Default for Docker Compose
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set up connection to the gRPC server (Python AI Service)
	conn, err := grpc.DialContext(
		ctx,
		aiServiceHost,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(), // Wait until the connection is established or timeout
	)
	if err != nil {
		log.Printf("Warning: Could not connect to AI service: %v. AI features will be unavailable.", err)
		return
	}

	AIClientConn = conn
	log.Println("Successfully connected to AI Service via gRPC at:", aiServiceHost)
}

// CloseGRPCClient closes the connection when the Go API shuts down.
func CloseGRPCClient() {
	if AIClientConn != nil {
		if err := AIClientConn.Close(); err != nil {
			log.Printf("Error closing gRPC connection: %v", err)
		}
	}
}

// TriggerTranslationAndAudio (Called from Clinic App flow)
func TriggerTranslationAndAudio(prescriptionData models.Prescription) error {
	if AIClientConn == nil {
		log.Println("Warning: AI service not connected. Skipping translation and audio generation.")
		return nil
	}
	// In a real implementation: Call the remote procedure on AIClientConn.
	log.Println("gRPC: Triggering translation and audio generation for Prescription ID:", prescriptionData.ID)
	time.Sleep(100 * time.Millisecond) // Simulate AI processing time
	// If successful, the Python service would update the DB (translated_text/audio_file_url)
	return nil
}

// TriggerReportProcessing (Called from Scanning Center App flow)
func TriggerReportProcessing(reportID string, fileData []byte) error {
	if AIClientConn == nil {
		log.Println("Warning: AI service not connected. Skipping report processing.")
		return nil
	}
	// In a real implementation: Call the remote procedure on AIClientConn.
	log.Println("gRPC: Triggering report processing for Report ID:", reportID)
	time.Sleep(500 * time.Millisecond) // Simulate AI processing time
	// If successful, the Python service would update the DB (simplified_summary/status)
	return nil
}

// QueryChatbot (Called from Patient App flow)
func QueryChatbot(query string, patientID string) (string, error) {
	if AIClientConn == nil {
		return "AI service is currently unavailable. Please try again later.", nil
	}
	// In a real implementation: Call the remote procedure on AIClientConn.
	log.Printf("gRPC: Querying chatbot for user %s with: %s", patientID, query)
	// Mock response
	return "Hello! I am the MediBridge AI Chatbot. I can answer basic health queries like, 'What is Paracetamol?', and guide you through the app's features.", nil
}