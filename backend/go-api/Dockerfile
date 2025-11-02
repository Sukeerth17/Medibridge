# Start from a minimal Go base image
FROM golang:1.21-alpine AS builder

# Set the working directory
WORKDIR /go/src/Medibridge/go-api

# Install git so 'go mod tidy' can resolve local module path
# This is necessary because 'go mod tidy' treats local packages like remote git repos.
RUN apk add --no-cache git 

# Copy all dependency definition files FIRST
COPY go.mod ./

# Download all external dependencies (creates go.sum)
RUN go mod download

# Copy all application source code (handlers, models, utils, and main.go)
# This invalidates the cache layer if any source file changes.
COPY . .

# Final dependency check and module graph validation
# This step forces Go to validate the module graph and recognize the local 'replace'
# directive against the full source code we just copied, generating the final go.sum.
# We then immediately build.
RUN go mod tidy && go build -o /Medibridge_api ./main.go

# Start a new, smaller stage for the final image
FROM alpine:latest

# Install CA certificates for HTTPS/TLS
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the built binary from the builder stage
COPY --from=builder /Medibridge_api .

# Expose the port (e.g., 8080) that the Gin server will listen on
EXPOSE 8080

# Command to run the executable
CMD ["./Medibridge_api"]
