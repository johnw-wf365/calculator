#!/bin/bash
# Calculator Platform — Rollback Script
# Reverts to the previous deployment

set -euo pipefail

APP_DIR="/opt/calculator"
APP_NAME="calculator"

echo "=== Rolling Back Calculator Platform ==="
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

cd "${APP_DIR}"

# Get previous tag/branch
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "")

if [ -z "${PREVIOUS_TAG}" ]; then
    echo "No previous tag found. Trying main branch..."
    PREVIOUS_TAG="main"
fi

echo "→ Rolling back to: ${PREVIOUS_TAG}"

git checkout "${PREVIOUS_TAG}"

# Reinstall and rebuild
pnpm install --frozen-lockfile
pnpm build

# Reload
pm2 reload "${APP_NAME}" || pm2 start ecosystem.config.cjs --name "${APP_NAME}"
pm2 save

echo "=== Rollback Complete ==="
echo "Now at: $(git describe --tags --always)"
