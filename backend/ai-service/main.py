from fastapi import FastAPI
import uvicorn
import time
import logging
import threading

# Import gRPC related libraries
from concurrent import futures
import grpc
# NOTE: The 'pb' and 'AIProcessingServicer' would come from
# compiled .proto files and a separate implementation file (e.g., processing/service.py)
# import pb_compiled_files.ai_service_pb2_grpc as pb_grpc 
# from processing.service import AIProcessingServicer 

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("AI-Service")

# Initialize the FastAPI application
app = FastAPI(
    title="MediBridge AI Microservice",
    description="Report Simplification and Translation Engine",
    version="1.0.0"
)

# --- 1. FastAPI Routes (For Health Check / Debugging) ---

@app.get("/health")
def health_check():
    """Endpoint for checking the status of the FastAPI server."""
    return {"status": "AI Service is running (FastAPI)", "timestamp": time.time()}

# --- 2. gRPC Server Setup ---

# Placeholder gRPC Service Implementation (would be in processing/service.py)
class MockAIProcessingServicer(): # Placeholder class name
    """Mocks the AI service methods called by the Go API."""
    
    # Method called by Go API for prescription flow
    def TranslateAndAudio(self, request, context):
        logger.info(f"gRPC received: TranslateAndAudio request for data.")
        # Simulate heavy NLP/ML processing
        time.sleep(1.5) 
        
        # In a real scenario, this would return a gRPC response object with:
        # translated_text and audio_file_url
        logger.info(f"Processing complete. Returning mock results.")
        # return pb.TranslateAndAudioResponse(translated_text="Mock Translation", audio_file_url="http://mock.com/audio.mp3")
        return None # Returning None for simplicity in this mock

    # Method called by Go API for report flow
    def ProcessReport(self, request, context):
        logger.info(f"gRPC received: ProcessReport request for file ID: {request.report_id}")
        # Text Extraction from original document (e.g., PDF) [cite: 43]
        # Simplification into patient-friendly summary [cite: 44]
        time.sleep(3.0) 
        
        # The Go API updates the status to "Ready to Share" once this is complete [cite: 93]
        logger.info(f"Report processing complete. Summary generated and saved.")
        # return pb.ProcessReportResponse(status="Simplified")
        return None 

    # Method called by Go API for chatbot flow
    def ChatbotQuery(self, request, context):
        logger.info(f"gRPC received: ChatbotQuery for: {request.query}")
        # Processes the health query and returns a conversational response [cite: 66]
        time.sleep(0.5)
        logger.info(f"Chatbot response generated.")
        # return pb.ChatbotResponse(answer="Mock response to your query.")
        return None

# Function to run the gRPC server in a separate thread
def serve_grpc():
    """Starts the gRPC server."""
    # gRPC runs on port 50051 (standard gRPC port, defined in docker-compose)
    grpc_port = '50051' 
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # pb_grpc.add_AIProcessingServicer_to_server(MockAIProcessingServicer(), server) 
    
    server.add_insecure_port(f'[::]:{grpc_port}')
    server.start()
    logger.info(f"gRPC Server running on port {grpc_port}")
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)
        
# --- 3. Main execution block to start both servers ---

if __name__ == "__main__":
    # Start the gRPC server in a background thread
    grpc_thread = threading.Thread(target=serve_grpc)
    grpc_thread.daemon = True # Allows the main program to exit even if the thread is running
    grpc_thread.start()
    
    # Start the FastAPI server (Uvicorn)
    # The CMD in the Dockerfile will execute this if we were to use the Docker CMD directly
    logger.info("Starting FastAPI Uvicorn server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)