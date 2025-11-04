package handlers

import (
	"encoding/csv"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"Medibridge/go-api/utils"
)

// GetDrugDatabase handles GET /v1/clinic/drugs
// Returns all drugs from the database
func GetDrugDatabase(c *gin.Context) {
	query := `SELECT id, name, type, strength FROM drugs ORDER BY name`
	
	rows, err := utils.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch drugs"})
		return
	}
	defer rows.Close()

	type Drug struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Type     string `json:"type"`
		Strength string `json:"strength"`
	}

	drugs := []Drug{}
	for rows.Next() {
		var drug Drug
		if err := rows.Scan(&drug.ID, &drug.Name, &drug.Type, &drug.Strength); err != nil {
			continue
		}
		drugs = append(drugs, drug)
	}

	c.JSON(http.StatusOK, drugs)
}

// SearchDrugs handles GET /v1/clinic/drugs/search?q=...
// Returns filtered drugs based on search query
func SearchDrugs(c *gin.Context) {
	query := c.Query("q")
	if query == "" || len(query) < 2 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	sqlQuery := `
		SELECT id, name, type, strength 
		FROM drugs 
		WHERE LOWER(name) LIKE $1 
		ORDER BY name 
		LIMIT 10
	`
	
	rows, err := utils.DB.Query(sqlQuery, "%"+strings.ToLower(query)+"%")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search drugs"})
		return
	}
	defer rows.Close()

	type Drug struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Type     string `json:"type"`
		Strength string `json:"strength"`
	}

	drugs := []Drug{}
	for rows.Next() {
		var drug Drug
		if err := rows.Scan(&drug.ID, &drug.Name, &drug.Type, &drug.Strength); err != nil {
			continue
		}
		drugs = append(drugs, drug)
	}

	c.JSON(http.StatusOK, drugs)
}

// UploadDrugCSV handles POST /v1/admin/drugs/upload
// Allows admin to upload a CSV file to populate the drugs database
func UploadDrugCSV(c *gin.Context) {
	file, _, err := c.Request.FormFile("csv")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV file required"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	
	// Read header
	headers, err := reader.Read()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CSV format"})
		return
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "CSV must have a 'name' column"})
		return
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create drugs table"})
		return
	}

	// Clear existing data
	_, err = utils.DB.Exec(`TRUNCATE TABLE drugs`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear drugs table"})
		return
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

	c.JSON(http.StatusOK, gin.H{
		"message": "Drugs uploaded successfully",
		"count":   count,
	})
}