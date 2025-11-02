# Start from a Python slim base image for a small container size
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code
COPY . .

# Expose the gRPC port (50051) for the Go API to connect to
EXPOSE 50051

# Expose the FastAPI/Uvicorn port (8000) for potential health checks/debugging
EXPOSE 8000

# The command to run the FastAPI application using Uvicorn
# We will primarily use gRPC, but Uvicorn is needed for FastAPI standard startup
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]