# Start from a minimal Go base image
FROM golang:1.21-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the application binary
RUN go build -o /medi_bridge_api ./main.go

# Start a new, smaller stage for the final image
FROM alpine:latest

# Install CA certificates for HTTPS/TLS
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the built binary from the builder stage
COPY --from=builder /medi_bridge_api .

# Expose the port (e.g., 8080) that the Gin server will listen on
EXPOSE 8080

# Command to run the executable
CMD ["./medi_bridge_api"]