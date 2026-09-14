# Calculator Platform

Utility calculator websites for US, UK, CA, and AU markets.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Ads:** Google AdSense
- **Deployment:** Docker + GitHub Actions
- **Monitoring:** UptimeRobot + Sentry

## Repository Structure

```
calculator/
├── .github/workflows/     # CI/CD definitions
│   ├── calculator-ci.yml
│   ├── calculator-staging.yml
│   └── calculator-production.yml
├── doc/cicd/              # CI/CD documentation
├── github-actions/        # GitHub Actions workflow files
├── infrastructure/        # Terraform and server setup
├── monitoring/            # Nginx and monitoring config
├── scripts/               # Deployment scripts
├── terraform/             # UpCloud Terraform configs
├── src/                   # Application source (Zoe)
├── Dockerfile             # Docker build
├── nginx.conf             # Nginx config
└── package.json           # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (local or Docker)

### Local Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

The app runs at http://localhost:3000

### Database

Local development uses PGlite (embedded PostgreSQL) by default.
Set `DATABASE_URL` to use an external PostgreSQL instance.

## CI/CD

See [doc/cicd/README.md](doc/cicd/README.md) for full documentation.

- **CI:** Runs on every PR and push to main (lint, typecheck, test, build)
- **Staging:** Auto-deploys on merge to main
- **Production:** Deploys on GitHub release publish

## Environments

| Environment | Domain | Deploy Trigger |
|-------------|--------|---------------|
| Local | localhost | `pnpm dev` |
| Staging | staging.calculators.workforce365.ai | Merge to main |
| Production | calculators.workforce365.ai | GitHub release |

## License

Private — WorkForce365.ai
