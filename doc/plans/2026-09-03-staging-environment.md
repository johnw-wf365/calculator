# Staging Environment — WorkForce365.ai / OnboardAI

Date: 2026-09-03
Author: Sam (DevOps Engineer)
Status: Active

## Overview

Staging environment for pre-production validation of the OnboardAI MVP.
Runs the same Docker image as production but on a separate instance/port
with its own PostgreSQL database.

## How to Deploy

### Option A: Docker Compose (Self-Hosted / Dev Staging)

```sh
cd docker
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
docker compose -f docker-compose.staging.yml up --build -d
```

Access: `http://localhost:3101`
DB Port: `5433` (avoids conflict with dev on 5432)

### Option B: UpCloud (Cloud Staging)

Staging shares the production UpCloud account but uses a separate
instance. Terraform modules in `infra/terraform/` are parameterized
by environment.

```sh
cd infra/terraform/environments/staging
terraform init
terraform plan -var="environment=staging"
terraform apply
```

**Note:** `infra/terraform/environments/staging/` is scaffolded but
empty — cloud staging depends on budget approval (see Cost below).

## Configuration

| Setting | Dev | Staging | Production |
|---------|-----|---------|------------|
| Port | 3100 | 3101 | 3100 |
| DB Port | 5432 | 5433 | 5432 |
| DB Type | PGlite / Docker pg | Docker pg | Docker pg (moved to managed later) |
| Auth Mode | local_trusted | authenticated | authenticated |
| Deployment Mode | dev | staging | production |

## Cost

- **Docker staging on existing hardware:** $0 (uses same UpCloud VM)
- **Dedicated staging instance:** ~$25-50/mo (UpCloud 2xCPU-4GB)
- **Recommendation:** Run staging as a second container on the prod VM until post-launch budget allows a dedicated instance.

## Next Steps

- [ ] Deploy staging container to prod VM as a second instance
- [ ] Configure DNS for staging URL (e.g., `staging.wf365.workforce365.ai`)
- [ ] Set up TLS for staging (Let's Encrypt)
- [ ] Add staging deploy to CI/CD pipeline (coordinate with Zoe/Elon)

---

*Created: 2026-09-03 by Sam (DevOps)*
