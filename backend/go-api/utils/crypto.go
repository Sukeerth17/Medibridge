package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

// The AES key (must be 32 bytes for AES-256) loaded from the .env file
// NOTE: This variable is initialized when the program starts.
var aesKey = []byte(os.Getenv("AES_256_KEY"))

// Encrypt takes a plaintext string and returns the hex-encoded ciphertext.
func Encrypt(plaintext string) (string, error) {
	// Add a check to ensure the key length is correct before using it
	if len(aesKey) != 32 {
		return "", fmt.Errorf("AES_256_KEY must be exactly 32 bytes, current length: %d", len(aesKey))
	}

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Create a nonce (Number used once)
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Seal encrypts and authenticates the plaintext
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	
	// Return the result as a hex string for easy storage/transmission
	return hex.EncodeToString(ciphertext), nil
}

// Decrypt takes a hex-encoded ciphertext string and returns the original plaintext.
func Decrypt(ciphertextHex string) (string, error) {
	// Add a check to ensure the key length is correct before using it
	if len(aesKey) != 32 {
		return "", fmt.Errorf("AES_256_KEY must be exactly 32 bytes, current length: %d", len(aesKey))
	}
	
	ciphertext, err := hex.DecodeString(ciphertextHex)
	if err != nil {
		return "", fmt.Errorf("could not decode hex ciphertext: %w", err)
	}

	block, err := aes.NewCipher(aesKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", fmt.Errorf("ciphertext too short")
	}

	// Split the ciphertext into the nonce and the actual encrypted data
	nonce, encryptedData := ciphertext[:nonceSize], ciphertext[nonceSize:]

	// Open decrypts and authenticates the data
	plaintext, err := gcm.Open(nil, nonce, encryptedData, nil)
	if err != nil {
		return "", fmt.Errorf("could not decrypt data: %w", err)
	}

	return string(plaintext), nil
}
