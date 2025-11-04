package handlers

import (
	"encoding/csv"
	"io"
	"net/http"
	"os"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"Medibridge/go-api/utils"
)

// The path for temporary file storage within the container's filesystem.
const TempUploadPath = "/tmp/uploads" 

// UploadDrugCSV handles POST /v1/admin/drugs/upload
// Accepts a multipart form file (field name: "csv") containing a CSV of drugs.
// The file is temporarily saved, loaded into the database, and then deleted.
func UploadDrugCSV(c *gin.Context) {
	// Parse multipart form
	file, header, err := c.Request.FormFile("csv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV file required (field name: 'csv')"})
		return
	}
	defer file.Close()

	// 1. Ensure the temporary upload directory exists
	if err := os.MkdirAll(TempUploadPath, 0755); err != nil {
		log.Printf("Error creating temp directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not prepare file storage"})
		return
	}

	// 2. Save file to the temporary path
	dstPath := TempUploadPath + "/" + header.Filename
	dst, err := os.Create(dstPath)
	if err != nil {
		log.Printf("Error creating destination file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create destination file"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		log.Printf("Error saving file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save uploaded file"})
		return
	}

	// 3. Process the CSV file
	count, err := processDrugCSV(dstPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load drugs from CSV", "details": err.Error()})
		return
	}
	
	// 4. Clean up the temporary file
	if err := os.Remove(dstPath); err != nil {
		log.Printf("Warning: Failed to delete temporary file %s: %v", dstPath, err)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Drugs CSV uploaded and loaded successfully",
		"filename": header.Filename,
		"count": count,
	})
}

// processDrugCSV processes a CSV file and loads drugs into the database
func processDrugCSV(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	
	// Read header
	headers, err := reader.Read()
	if err != nil {
		return 0, err
	}

	// Find column indices
	nameIdx := -1
	idIdx := -1
	typeIdx := -1
	strengthIdx := -1

	for i, header := range headers {
		h := strings.ToLower(strings.TrimSpace(header))
		switch h {
		case "name":
			nameIdx = i
		case "id":
			idIdx = i
		case "type":
			typeIdx = i
		case "strength":
			strengthIdx = i
		}
	}

	if nameIdx == -1 {
		return 0, err
	}

	// Create table if not exists
	_, err = utils.DB.Exec(`
		CREATE TABLE IF NOT EXISTS drugs (
			id VARCHAR(50) PRIMARY KEY,
			name VARCHAR(200) NOT NULL,
			type VARCHAR(50),
			strength VARCHAR(50)
		)
	`)
	if err != nil {
		return 0, err
	}

	// Clear existing data
	_, err = utils.DB.Exec(`TRUNCATE TABLE drugs`)
	if err != nil {
		log.Printf("Warning: Failed to clear drugs table: %v", err)
	}

	// Insert drugs
	count := 0
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue
		}

		if len(record) <= nameIdx {
			continue
		}

		name := strings.TrimSpace(record[nameIdx])
		if name == "" {
			continue
		}

		id := ""
		if idIdx != -1 && idIdx < len(record) {
			id = strings.TrimSpace(record[idIdx])
		}
		if id == "" {
			id = "drug-" + strings.ToLower(strings.ReplaceAll(name, " ", "-"))
		}

		drugType := "allopathy"
		if typeIdx != -1 && typeIdx < len(record) {
			drugType = strings.TrimSpace(record[typeIdx])
		}

		strength := ""
		if strengthIdx != -1 && strengthIdx < len(record) {
			strength = strings.TrimSpace(record[strengthIdx])
		}

		_, err = utils.DB.Exec(`
			INSERT INTO drugs (id, name, type, strength) 
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (id) DO UPDATE 
			SET name = $2, type = $3, strength = $4
		`, id, name, drugType, strength)

		if err == nil {
			count++
		}
	}

	return count, nil
}