# Deployment Runbook

## Prerequisites

- GitHub repo access (push + release creation)
- SSH access to staging and production servers
- GitHub Actions secrets configured
- Domain DNS pointing to server IP
- Docker installed on target servers

## Initial Setup (One-time)

### 1. Create GitHub Repository

```bash
# Create repo on GitHub (or via gh CLI)
gh repo create paperclipai/calculator --private

# Push initial code
git remote add origin git@github.com:paperclipai/calculator.git
git push -u origin main
```

### 2. Configure GitHub Actions Secrets

Go to: Settings → Secrets and variables → Actions → New repository secret

Add all secrets listed in the CI/CD README for staging and production.

### 3. Set Up Server

On the target server (staging/production):

```bash
# Create deploy user
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# Create app directory
sudo mkdir -p /opt/calculator
sudo chown deploy:deploy /opt/calculator

# Set up SSH key for deploy user
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# Install Docker
curl -fsSL https://get.docker.com | sh

# Set up nginx
sudo apt update && sudo apt install -y nginx
sudo cp nginx.conf /etc/nginx/sites-available/calculator
sudo ln -s /etc/nginx/sites-available/calculator /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Set Up Database

```bash
# On the server, create staging and production databases
sudo -u postgres psql -c "CREATE DATABASE calculator_staging;"
sudo -u postgres psql -c "CREATE DATABASE calculator_production;"
sudo -u postgres psql -c "CREATE USER calculator WITH ENCRYPTED PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE calculator_staging TO calculator;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE calculator_production TO calculator;"
```

### 5. Set Up UptimeRobot

1. Create account at https://uptimerobot.com
2. Add HTTP monitor for `https://staging.calculators.workforce365.ai/api/health`
3. Add HTTP monitor for `https://calculators.workforce365.ai/api/health`
4. Set interval to 5 minutes
5. Configure Telegram alert contact

## Regular Deployment

### Deploy to Staging

Staging auto-deploys on every merge to main. No manual action needed.

To trigger manually:
```bash
# Via GitHub Actions UI: Actions → Deploy to Staging → Run workflow
```

### Deploy to Production

1. Create a release on GitHub:
   - Go to Releases → Draft a new release
   - Choose a tag (e.g., `v1.0.0`)
   - Add release notes
   - Publish release

2. The workflow will automatically:
   - Build and push Docker image
   - Deploy to production server
   - Run health check
   - Send Telegram notification

### Manual Deploy (Emergency)

If GitHub Actions is down:

```bash
# On the server
cd /opt/calculator
export IMAGE_TAG=prod-latest
export DATABASE_URL="postgresql://..."
export NEXTAUTH_SECRET="..."
export NEXTAUTH_URL="https://calculators.workforce365.ai"
export STRIPE_SECRET_KEY="..."
export ADSENSE_CLIENT_ID="..."
./scripts/deploy.sh production
```

## Rollback

### Quick Rollback (Container Level)

```bash
cd /opt/calculator
./scripts/rollback.sh production
```

This restores the previous container.

### Git-Level Rollback

```bash
# Find the merge commit to revert
git log --oneline -10

# Revert it
git revert -m 1 <merge-commit-sha>
git push origin main

# For production, create a new release from previous tag
# Or manually deploy previous image tag
```

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs: Actions → Failed workflow → View logs
2. Check server logs: `ssh deploy@server "docker logs calculator-production"`
3. Check deploy log: `ssh deploy@server "tail -50 /var/log/calculator-deploy.log"`

### Health Check Fails

1. Check if container is running: `docker ps | grep calculator`
2. Check container logs: `docker logs calculator-production`
3. Check nginx: `sudo nginx -t && sudo systemctl status nginx`
4. Check database connection: `docker exec calculator-production psql $DATABASE_URL -c "SELECT 1"`

### Database Migration Fails

1. Check migration status: `pnpm db:migrate:status`
2. Run migrations manually: `pnpm db:migrate`
3. If migration is stuck, check for locks: `SELECT * FROM pg_locks WHERE NOT granted;`

## Monitoring

- **UptimeRobot**: https://uptimerobot.com/dashboard
- **GitHub Actions**: https://github.com/paperclipai/calculator/actions
- **Container logs**: `docker logs -f calculator-production`
- **Nginx logs**: `sudo tail -f /var/log/nginx/access.log`
- **Application logs**: `docker logs calculator-production`
