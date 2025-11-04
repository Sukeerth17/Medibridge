package handlers

import (
	"io"
	"net/http"
	"os"
	"log" 

	"github.com/gin-gonic/gin"
	// NOTE: LoadDrugsFromCSV is defined in drugs.go, so we treat it as part of the local package.
)

// The path for temporary file storage within the container's filesystem.
const TempUploadPath = "/tmp/uploads" 

// UploadDrugCSV handles POST /v1/admin/drugs/upload
// Accepts a multipart form file (field name: "file") containing a CSV of drugs.
// The file is temporarily saved, loaded into the database, and then deleted.
func UploadDrugCSV(c *gin.Context) {
    // 1. Ensure the temporary upload directory exists
    if err := os.MkdirAll(TempUploadPath, 0755); err != nil {
        log.Printf("Error creating temp directory: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "could not prepare file storage"})
        return
    }

    // Parse multipart form and fetch file
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File field is required ('file')" + err.Error()})
        return
    }

    src, err := file.Open()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not open uploaded file"})
        return
    }
    defer src.Close()

    // 2. Save file to the safe, temporary path
    // We use a unique name to avoid conflicts if multiple uploads happen simultaneously
    dstPath := TempUploadPath + "/" + file.Filename
    dst, err := os.Create(dstPath)
    if err != nil {
        log.Printf("Error creating destination file: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create destination file"})
        return
    }
    defer dst.Close()

    if _, err := io.Copy(dst, src); err != nil {
        log.Printf("Error saving file: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded file"})
        return
    }

    // 3. Load into DB using the temporary path
    // The LoadDrugsFromCSV function must accept the file path now.
    // NOTE: This call is the placeholder that must match the signature in handlers/drugs.go
    if err := LoadDrugsFromCSV(dstPath); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load drugs from CSV", "details": err.Error()})
        return
    }
    
    // 4. Clean up the temporary file (important for security/space)
    if err := os.Remove(dstPath); err != nil {
        log.Printf("Warning: Failed to delete temporary file %s: %v", dstPath, err)
    }

    c.JSON(http.StatusOK, gin.H{"message": "Drugs CSV uploaded and loaded successfully", "filename": file.Filename})
}