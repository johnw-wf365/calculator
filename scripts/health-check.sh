#!/bin/bash
# Health check script for calculator platform
# Usage: ./scripts/health-check.sh <url>

set -euo pipefail

URL="${1:-http://localhost:3000/api/health}"

echo "Checking health at: ${URL}"

response=$(curl -sf -w "\n%{http_code}" "$URL" 2>&1) || {
    echo "ERROR: Health check failed"
    exit 1
}

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "OK: $body"
    exit 0
else
    echo "ERROR: HTTP $http_code - $body"
    exit 1
fi
