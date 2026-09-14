#!/bin/bash
set -euo pipefail

# Run database migrations for calculator platform
# Usage: scripts/run-migrations.sh [staging|production]
# Requires drizzle-kit generate to have been run first (creates SQL files in ./drizzle)

ENVIRONMENT=${1:-staging}
APP_DIR="/opt/calculator"

case "$ENVIRONMENT" in
    staging)
        cd "${APP_DIR}-staging"
        ;;
    production)
        cd "${APP_DIR}"
        ;;
    *)
        echo "Unknown environment: $ENVIRONMENT"
        exit 1
        ;;
esac

echo "Running migrations for $ENVIRONMENT..."

# Use drizzle-kit push for simple migration (auto-applies schema)
if command -v pnpm &> /dev/null; then
    pnpm exec drizzle-kit push:pg
elif command -v npx &> /dev/null; then
    npx drizzle-kit push:pg
else
    echo "Error: Neither pnpm nor npx found. Cannot run migrations."
    exit 1
fi

echo "Migrations completed for $ENVIRONMENT"
