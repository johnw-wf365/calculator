# Calculator Platform — CI/CD Documentation

## Overview

This document describes the CI/CD pipeline and deployment infrastructure for the calculator platform.

## Architecture

```
PR/ Push to main → GitHub Actions CI (lint, typecheck, test, build)
                           ↓
              Merge to main → Auto-deploy to staging
                           ↓
              GitHub Release → Deploy to production (manual approval)
                           ↓
              Health check → Nginx reload → Live
```

## Workflows

### 1. CI Workflow (`calculator-ci.yml`)

Triggers on PRs and pushes to main. Runs in parallel:

| Job | Purpose |
|-----|---------|
| lint | Code style and best practices |
| typecheck | TypeScript type validation |
| test | Unit and integration tests |
| build | Production build |

All jobs must pass before merging to main (branch protection).

### 2. Staging Deployment (`calculator-staging.yml`)

Auto-deploys on every merge to main:

1. Build production bundle
2. Build Docker image with staging env vars
3. Push to GHCR (GitHub Container Registry)
4. SSH to staging server and run deploy script
5. Health check staging URL

### 3. Production Deployment (`calculator-production.yml`)

Deploys on GitHub release publish (creates a release from a tag):

1. Build production bundle
2. Build Docker image with production env vars
3. Push to GHCR
4. SSH to production server and run deploy script
5. Health check production URL
6. Telegram notification on success/failure

## Environments

| Environment | Domain | Database | Deploy Trigger |
|-------------|--------|----------|---------------|
| Local | localhost | PGlite | `pnpm dev` |
| Staging | staging.calculators.workforce365.ai | PostgreSQL (staging DB) | Merge to main |
| Production | calculators.workforce365.ai | PostgreSQL (prod DB) | GitHub release |

## Secrets Management

All secrets are stored in GitHub Actions secrets (Settings → Secrets and variables → Actions):

### Staging Secrets
- `STAGING_DATABASE_URL` — PostgreSQL connection string
- `STAGING_NEXTAUTH_SECRET` — NextAuth.js secret
- `STAGING_STRIPE_SECRET_KEY` — Stripe API key
- `STAGING_ADSENSE_CLIENT_ID` — Google AdSense client ID
- `STAGING_SSH_HOST` — Staging server IP/hostname
- `STAGING_SSH_USER` — SSH username
- `STAGING_SSH_KEY` — SSH private key

### Production Secrets
- `PRODUCTION_DATABASE_URL` — PostgreSQL connection string
- `PRODUCTION_NEXTAUTH_SECRET` — NextAuth.js secret
- `PRODUCTION_STRIPE_SECRET_KEY` — Stripe API key
- `PRODUCTION_ADSENSE_CLIENT_ID` — Google AdSense client ID
- `PRODUCTION_SSH_HOST` — Production server IP/hostname
- `PRODUCTION_SSH_USER` — SSH username
- `PRODUCTION_SSH_KEY` — SSH private key

### Other
- `TELEGRAM_BOT_TOKEN` — Bot token for deployment notifications
- `TELEGRAM_CHAT_ID` — Chat ID for notifications

## Zero-Downtime Deployment

1. New container starts alongside old container
2. Database migrations run before container switch
3. Health check passes on new container
4. Nginx upstream switches to new container
5. Old container is stopped and removed

## Rollback

### Immediate (container level)
```bash
./scripts/rollback.sh staging
# or
./scripts/rollback.sh production
```

### Git-level
```bash
# Revert the merge commit
git revert -m 1 <merge-commit-sha>
git push origin main  # auto-redeploys staging
```

Or create a new release from a previous tag for production.

## File Structure

```
calculator/
├── .github/workflows/     # CI/CD definitions
│   ├── calculator-ci.yml
│   ├── calculator-staging.yml
│   └── calculator-production.yml
├── scripts/               # Deployment scripts
│   ├── deploy.sh          # Main deploy script
│   ├── health-check.sh    # Health check
│   └── rollback.sh        # Rollback script
├── doc/cicd/              # This documentation
├── Dockerfile             # Docker build
├── nginx.conf             # Nginx config
└── src/                   # Application source (Zoe)
```

## Cost

- GitHub Actions: Free (2,000 minutes/month)
- GHCR: Free (500 MB storage, 1 GB/month bandwidth)
- UptimeRobot: Free (50 monitors, 5-minute intervals)
- Cloudflare: Free CDN

Total CI/CD cost: $0/month.
