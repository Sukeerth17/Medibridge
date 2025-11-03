package utils

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// DB is the global database connection pool
var DB *sql.DB

// InitDatabase establishes connection to PostgreSQL
func InitDatabase() error {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// Set defaults if not provided
	if host == "" {
		host = "postgres"
	}
	if port == "" {
		port = "5432"
	}
	if user == "" {
		user = "medibridge_user"
	}
	if password == "" {
		password = "medibridge_pass"
	}
	if dbname == "" {
		dbname = "medibridge_db"
	}

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	// Retry connection up to 10 times (database might not be ready immediately)
	for i := 0; i < 10; i++ {
		DB, err = sql.Open("postgres", psqlInfo)
		if err != nil {
			log.Printf("Attempt %d: Failed to open database: %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		err = DB.Ping()
		if err != nil {
			log.Printf("Attempt %d: Failed to ping database: %v", i+1, err)
			time.Sleep(2 * time.Second)
			continue
		}

		// Success!
		log.Println("Successfully connected to PostgreSQL database")
		
		// Set connection pool settings
		DB.SetMaxOpenConns(25)
		DB.SetMaxIdleConns(5)
		DB.SetConnMaxLifetime(5 * time.Minute)
		
		return nil
	}

	return fmt.Errorf("failed to connect to database after 10 attempts: %w", err)
}

// CloseDatabase closes the database connection
func CloseDatabase() {
	if DB != nil {
		if err := DB.Close(); err != nil {
			log.Printf("Error closing database: %v", err)
		}
	}
}