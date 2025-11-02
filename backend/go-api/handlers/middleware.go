package handlers

import (
	"net/http"
	"strings"
	
	"github.com/gin-gonic/gin"
	"Medibridge/go-api/utils"
)

// AuthMiddleware is a Gin middleware that extracts and validates the JWT
// from the Authorization header for every protected endpoint.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
        // 1. Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

        // 2. Check for "Bearer " prefix
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization format. Expected 'Bearer [token]'"})
			c.Abort()
			return
		}
        
        tokenString := parts[1]

        // 3. Validate the token and get claims (ID, Role)
		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

        // 4. Store the validated user claims in the context for subsequent handlers
		c.Set("userID", claims.ID)
		c.Set("userRole", claims.Role)
        
		c.Next() // Continue to the next handler/logic
	}
}

// RBACMiddleware creates a middleware that restricts access based on allowed roles.
func RBACMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role information missing"}) 
			c.Abort()
			return
		}

		roleStr := userRole.(string)
		
        // Check if the user's role is in the list of allowed roles
		isAllowed := false
		for _, role := range allowedRoles {
			if roleStr == role {
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied. Insufficient role privileges."})
			c.Abort()
			return
		}

		c.Next() // Role is authorized, proceed
	}
}
