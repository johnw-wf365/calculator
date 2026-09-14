# GitHub Actions Secrets Configuration

## Overview

This guide covers the secrets required for the calculator platform CI/CD pipeline.

## Required Secrets

### Staging Environment

Configure at: https://github.com/johnw-wf365/calculator/settings/secrets/actions

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `STAGING_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/calculator_staging` |
| `STAGING_NEXTAUTH_SECRET` | NextAuth.js session encryption | Random 32+ char string |
| `STAGING_STRIPE_SECRET_KEY` | Stripe test API key | `sk_test_...` |
| `STAGING_ADSENSE_CLIENT_ID` | Google AdSense publisher ID | `ca-pub-...` |
| `STAGING_HOST` | Staging server IP or hostname | `123.456.789.0` |
| `STAGING_USER` | SSH username for staging server | `deploy` |
| `STAGING_SSH_KEY` | SSH private key for staging server | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOMAIN` | Staging domain | `staging.calculators.workforce365.ai` |

### Production Environment

Configure at: https://github.com/johnw-wf365/calculator/settings/secrets/actions

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `PROD_HOST` | Production server IP or hostname | `123.456.789.0` |
| `PROD_USER` | SSH username for production server | `deploy` |
| `PROD_SSH_KEY` | SSH private key for production server | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOMAIN` | Production domain | `calculators.workforce365.ai` |
| `PRODUCTION_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/calculator_production` |
| `PRODUCTION_NEXTAUTH_SECRET` | NextAuth.js session encryption | Random 32+ char string |
| `PRODUCTION_STRIPE_SECRET_KEY` | Stripe live API key | `sk_live_...` |
| `PRODUCTION_ADSENSE_CLIENT_ID` | Google AdSense publisher ID | `ca-pub-...` |

## How to Add Secrets

1. Go to https://github.com/johnw-wf365/calculator/settings/secrets/actions
2. Click "New repository secret"
3. Enter the secret name and value
4. Click "Add secret"

## Generating NEXTAUTH_SECRET

Generate a secure secret:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## SSH Key Setup

For each server, generate a deploy key:

```bash
# On the server, create deploy user
sudo useradd -m -s /bin/bash deploy

# Generate SSH key pair
ssh-keygen -t ed25519 -f calculator-deploy-key -C "calculator-deploy"

# Add public key to deploy user's authorized_keys
sudo mkdir -p /home/deploy/.ssh
sudo cp calculator-deploy-key.pub /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# Copy private key to GitHub secrets
cat calculator-deploy-key
# Add the output as the SSH key secret value
```

## Security Notes

- Never commit secrets to the repository
- Never share secret values in comments or documentation
- Rotate SSH keys periodically
- Use different secrets for staging and production

## Environment Protection Rules

The following branch protection rules are recommended:

- Require status checks to pass before merging
- Require pull request reviews before merging
- Restrict push access to main (PR only)

## Verifying Secrets

To verify secrets are configured correctly:

1. Create a test PR
2. Check that the CI workflow runs
3. Check that the deploy workflow can SSH to the server
4. Check that the application can connect to the database
