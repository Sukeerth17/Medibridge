# Start from a minimal Go base image for the builder stage
FROM golang:1.21-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and the vendor directory
# CRITICAL: This copies the vendor directory generated on the host
COPY go.mod go.sum ./
COPY vendor/ vendor/
COPY . .

# Build the application using vendored dependencies
# CRITICAL FIX: The -mod=vendor flag forces the compiler to use the local 'vendor/' directory.
# This bypasses the problematic network lookup that caused the "missing go.sum entry" error.
RUN CGO_ENABLED=0 GOOS=linux go build -mod=vendor -a -installsuffix cgo -o medibridge_api ./main.go

# --- Final Runtime Image ---
FROM alpine:latest

# Install CA certificates for HTTPS/TLS
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the built binary from the builder stage
COPY --from=builder /app/medibridge_api .

# Expose the port (8080) that the Gin server will listen on
EXPOSE 8080

# Command to run the executable
CMD ["./medibridge_api"]