#!/bin/bash
set -euo pipefail

# Run database migrations for calculator platform
# Usage: scripts/run-migrations.sh [staging|production]

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

if command -v pnpm &> /dev/null; then
    pnpm db:migrate
elif command -v npx &> /dev/null; then
    npx drizzle-kit migrate
else
    echo "Error: Neither pnpm nor npx found. Cannot run migrations."
    exit 1
fi

echo "Migrations completed for $ENVIRONMENT"
