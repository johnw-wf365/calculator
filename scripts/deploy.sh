#!/bin/bash
# Calculator Platform — Deployment Script
# Triggered by GitHub Actions

set -euo pipefail

APP_DIR="/opt/calculator"
APP_NAME="calculator"
NODE_ENV="${NODE_ENV:-production}"
PM2_CONFIG="${APP_DIR}/ecosystem.config.cjs"

echo "=== Deploying Calculator Platform ==="
echo "Environment: ${NODE_ENV}"
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

cd "${APP_DIR}"

# Pull latest code
echo "→ Pulling latest code..."
git fetch --all --tags
git checkout "${DEPLOY_REF:-main}"

# Install dependencies
echo "→ Installing dependencies..."
pnpm install --frozen-lockfile

# Build application
echo "→ Building..."
pnpm build

# Run database migrations (if any)
# echo "→ Running migrations..."
# pnpm db:migrate

# Reload via PM2
echo "→ Reloading app..."
if pm2 describe "${APP_NAME}" > /dev/null 2>&1; then
    pm2 reload "${PM2_CONFIG}" --env "${NODE_ENV}"
else
    pm2 start "${PM2_CONFIG}" --env "${NODE_ENV}" --name "${APP_NAME}"
fi

pm2 save

echo "=== Deployment Complete ==="
