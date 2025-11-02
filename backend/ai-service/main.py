from fastapi import FastAPI
import uvicorn
import time
import logging
import threading
from concurrent import futures
import grpc
from processing.ai_logic import extract_text_from_report, simplify_report_summary, translate_prescription, generate_audio_narration, process_chatbot_query

# NOTE: Since we are not compiling .proto files, we will mock the gRPC server setup here.
# In a full build, the lines below would be uncommented and correct pb packages would be imported.
# import pb_compiled_files.ai_service_pb2_grpc as pb_grpc 
# import pb_compiled_files.ai_service_pb2 as pb

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

# --- 2. Mock gRPC Service Implementation ---

class MockAIProcessingServicer():
    """Mocks the AI service methods called by the Go API."""
    
    # Mock for TranslateAndAudio (Prescription Flow)
    def TranslateAndAudio(self, request, context):
        logger.info(f"gRPC received: TranslateAndAudio request for data.")
        # Mocking calls to core logic
        translated = translate_prescription("Original Text", "Hindi")
        audio_url = generate_audio_narration(translated)
        time.sleep(1.5) 
        logger.info("Processing complete. Mocking DB update.")
        # return pb.TranslateAndAudioResponse(...)
        return None 

    # Mock for ProcessReport (Scanning Flow)
    def ProcessReport(self, request, context):
        logger.info(f"gRPC received: ProcessReport request for file.")
        # Mocking calls to core logic
        technical_text = extract_text_from_report(b"mock_file_data")
        simplified = simplify_report_summary(technical_text)
        time.sleep(3.0) 
        logger.info(f"Report processing complete. Simplified Summary: {simplified[:30]}...")
        # return pb.ProcessReportResponse(...)
        return None 

    # Mock for ChatbotQuery (Patient Flow)
    def ChatbotQuery(self, request, context):
        logger.info(f"gRPC received: ChatbotQuery for: {request.query}")
        response = process_chatbot_query(request.query, [])
        time.sleep(0.5)
        logger.info(f"Chatbot response generated.")
        # return pb.ChatbotResponse(...)
        return None

# Function to run the gRPC server in a separate thread
def serve_grpc():
    """Starts the gRPC server."""
    grpc_port = '50051' 
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    
    # NOTE: This line would be used in a real implementation:
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
    grpc_thread.daemon = True 
    grpc_thread.start()
    
    # Start the FastAPI server (Uvicorn)
    logger.info("Starting FastAPI Uvicorn server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
