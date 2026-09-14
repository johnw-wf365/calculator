# Environment Configuration

## Overview

The calculator platform runs in three environments: local development, staging, and production.

## Environment Variables

### Common Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode (development/production) | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js session encryption secret | Yes |
| `NEXTAUTH_URL` | Base URL for NextAuth.js | Yes |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `ADSENSE_CLIENT_ID` | Google AdSense publisher ID | Yes |
| `PORT` | Application port | No (default: 3000) |

### Local Development

File: `.env.local` (git-ignored)

```env
NODE_ENV=development
DATABASE_URL=postgresql://calculator:password@localhost:5432/calculator_dev
NEXTAUTH_SECRET=dev-secret-change-me
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
ADSENSE_CLIENT_ID=ca-pub-...
PORT=3000
```

### Staging

Stored in GitHub Actions secrets as `STAGING_*`.

```env
NODE_ENV=production
DATABASE_URL=postgresql://calculator:password@staging-db:5432/calculator_staging
NEXTAUTH_SECRET=<staging-secret>
NEXTAUTH_URL=https://staging.calculators.workforce365.ai
STRIPE_SECRET_KEY=sk_test_...
ADSENSE_CLIENT_ID=ca-pub-...
PORT=3000
```

### Production

Stored in GitHub Actions secrets as `PRODUCTION_*`.

```env
NODE_ENV=production
DATABASE_URL=postgresql://calculator:password@prod-db:5432/calculator_production
NEXTAUTH_SECRET=<production-secret>
NEXTAUTH_URL=https://calculators.workforce365.ai
STRIPE_SECRET_KEY=sk_live_...
ADSENSE_CLIENT_ID=ca-pub-...
PORT=3000
```

## Database Configuration

### Connection String Format

```
postgresql://<user>:<password>@<host>:<port>/<database>
```

### Database Names

| Environment | Database Name |
|-------------|---------------|
| Local | `calculator_dev` |
| Staging | `calculator_staging` |
| Production | `calculator_production` |

### Migrations

Run migrations:
```bash
pnpm db:migrate
```

Generate new migration:
```bash
pnpm db:generate
```

### Backups

Daily automated backup via cron job on the server:

```bash
# /etc/cron.d/calculator-backup
0 2 * * * deploy /opt/calculator/scripts/backup.sh >> /var/log/calculator-backup.log 2>&1
```

## Domain Configuration

### Staging

- Domain: `staging.calculators.workforce365.ai`
- DNS: A record → server IP
- SSL: Let's Encrypt via certbot

### Production

- Domain: `calculators.workforce365.ai`
- DNS: A record → server IP
- SSL: Let's Encrypt via certbot

### SSL Certificate Renewal

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d calculators.workforce365.ai -d staging.calculators.workforce365.ai

# Auto-renewal is set up automatically
```

## Server Configuration

### Staging Server

- Host: staging.calculators.workforce365.ai
- User: deploy
- App directory: /opt/calculator
- Container name: calculator-staging
- Port: 3000 (internal), 443 (nginx)

### Production Server

- Host: calculators.workforce365.ai
- User: deploy
- App directory: /opt/calculator
- Container name: calculator-production
- Port: 3000 (internal), 443 (nginx)

## Nginx Configuration

See `nginx.conf` in the project root. Key points:

- Reverse proxy to localhost:3000
- SSL termination
- Security headers
- Gzip compression
- Static file caching

## Monitoring

### Health Check Endpoint

```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-09-14T17:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### UptimeRobot Monitors

| Monitor | URL | Interval |
|---------|-----|----------|
| Staging | https://staging.calculators.workforce365.ai/api/health | 5 min |
| Production | https://calculators.workforce365.ai/api/health | 5 min |

### Log Locations

| Log | Path |
|-----|------|
| Deploy log | /var/log/calculator-deploy.log |
| Nginx access | /var/log/nginx/access.log |
| Nginx error | /var/log/nginx/error.log |
| Container | docker logs calculator-production |
| Backup | /var/log/calculator-backup.log |
