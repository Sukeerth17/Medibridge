#!/bin/bash

# MediBridge Drug Database Upload Script
# Usage: ./upload-drugs.sh /path/to/drugs.csv

set -e

API_URL="${API_URL:-http://localhost:8080}"
CSV_FILE="${1:-drugs.csv}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 MediBridge Drug Database Upload"
echo "=================================="

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}❌ Error: CSV file '$CSV_FILE' not found${NC}"
    echo "Usage: $0 /path/to/drugs.csv"
    exit 1
fi

echo -e "${YELLOW}📄 CSV File: $CSV_FILE${NC}"

# Prompt for credentials
echo ""
echo "Please enter clinic credentials:"
read -p "Phone number (e.g., 1122334455): " PHONE
read -sp "Password: " PASSWORD
echo ""

# Login and get JWT token
echo -e "${YELLOW}🔐 Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"$PHONE\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Login failed. Please check credentials.${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"

# Upload CSV
echo -e "${YELLOW}📤 Uploading drug database...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/v1/admin/drugs/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "csv=@$CSV_FILE")

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q "successfully"; then
    COUNT=$(echo "$UPLOAD_RESPONSE" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo -e "${GREEN}✓ Upload successful!${NC}"
    echo -e "${GREEN}📊 $COUNT drugs uploaded to database${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    echo "Response: $UPLOAD_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 Done! Drug database is ready to use in the clinic app."