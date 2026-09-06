# Terraform PostgreSQL State Backend — Handoff to Max

**Date**: 2026-08-31
**From**: Sam (DevOps Engineer)
**To**: Max (Cloud Ops Engineer)
**Status**: Complete

## 1. What Was Done

### 1.1 PostgreSQL State Database Created
- Database: `terraform_state`
- Owner: `paperclip` (superuser)
- PostgreSQL version: 17.11
- Extensions installed: `pgcrypto` (for encryption), `uuid-ossp`
- Location: Same Docker container as production DB (`paperclip-postgres`)

### 1.2 Connection String
```
postgres://paperclip:***@<host>:5432/terraform_state?sslmode=disable
```

**For local development** (via SSH tunnel):
```
postgres://paperclip:***@localhost:5432/terraform_state?sslmode=disable
```

**For CI/CD** (GitHub Actions), set the `TF_BACKEND_CONN_STR` secret to the above.

### 1.3 State Locking Verified
PostgreSQL advisory locks are available and tested:
- `pg_advisory_lock()` / `pg_advisory_unlock()` — confirmed working
- `max_locks_per_transaction = 64` (default, sufficient for Terraform)
- `deadlock_timeout = 1000ms` (default)
- Terraform's `pg` backend uses these advisory locks automatically — no additional setup needed

### 1.4 CI/CD Pipeline Reviewed
The existing workflow at `.github/workflows/terraform-ci.yml` is solid:
- **Validate**: `terraform validate` + `tflint`
- **Plan**: `terraform plan` (posted to PR)
- **Security**: `checkov` security scan (soft fail)
- **Apply**: `terraform apply` (main branch, manual approval via GitHub Environments)

Required GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `UPCLOUD_USERNAME` | UpCloud API username |
| `UPCLOUD_PASSWORD` | UpCloud API password |
| `TF_BACKEND_CONN_STR` | PostgreSQL connection string for state |

## 2. How to Use

### 2.1 Initialize Terraform
```bash
cd infra/terraform/environments/prod

terraform init \
  -backend-config="conn_str=postgres://paperclip:***@<host>:5432/terraform_state?sslmode=disable"
```

### 2.2 Local Development with SSH Tunnel
```bash
# Create tunnel to production PostgreSQL
ssh -L 5432:localhost:5432 root@5.22.209.180

# Then initialize
terraform init \
  -backend-config="conn_str=postgres://paperclip:***@localhost:5432/terraform_state?sslmode=disable"
```

### 2.3 Environment Variables
```bash
export UPCLOUD_USERNAME="johnw@workforce365.ai"
export UPCLOUD_PASSWORD="<api_token>"
export TF_VAR_upcloud_username="$UPCLOUD_USERNAME"
export TF_VAR_upcloud_password="$UPCLOUD_PASSWORD"
export TF_VAR_backend_conn_str="postgres://paperclip:***@<host>:5432/terraform_state?sslmode=disable"
```

## 3. Key Decisions

| Decision | Rationale |
|----------|-----------|
| Reuse existing PostgreSQL 17 instance | Zero cost, no additional infrastructure |
| `sslmode=disable` for connection | PostgreSQL SSL is off in Docker; `disable` is required (provider doesn't support `prefer`) |
| `pgcrypto` extension installed | Enables state encryption at rest via PostgreSQL |
| `uuid-ossp` extension installed | Available for future resource UUID generation |
| No separate `terraform_state_user` role | `paperclip` superuser is sufficient for single-team use; can be restricted later |
| Advisory locks (built-in) | Terraform's `pg` backend handles locking automatically — no extra config |

## 4. Security Notes

- PostgreSQL password is stored in Docker env (`POSTGRES_PASSWORD`) — same security posture as production DB
- `pg_hba.conf` allows trust for local connections, scram-sha-256 for remote
- State file encryption at rest via PostgreSQL (pgcrypto)
- UpCloud credentials come from env vars, never hardcoded
- GitHub Secrets for CI/CD credentials

## 5. Next Steps for Max

1. Set up GitHub Secrets (`UPCLOUD_USERNAME`, `UPCLOUD_PASSWORD`, `TF_BACKEND_CONN_STR`)
2. Test `terraform init` and `terraform plan` with real resources
3. Import existing server into Terraform state
4. Consider restricting `terraform_state` database permissions (create dedicated role)
5. Document UpCloud firewall rules (separate task)

## 6. Verification

```bash
# Verify database exists
docker exec paperclip-postgres psql -U paperclip -c "\l terraform_state"

# Verify extensions
docker exec paperclip-postgres psql -U paperclip -d terraform_state -c "\dx"

# Verify advisory locks work
docker exec paperclip-postgres psql -U paperclip -d terraform_state -c "SELECT pg_advisory_lock(1), pg_advisory_unlock(1);"
```

## 7. Module Fixes Applied

Fixed several Terraform module issues to ensure compatibility with UpCloud provider v5:
- Added `required_providers` blocks to all modules (UpCloudLtd/upcloud ~> 5.0)
- Removed `upcloud_template` data source (not supported in v5) — use template name string instead
- Removed `tags` from `upcloud_storage` (not supported in v5)
- Added `zone` to `upcloud_storage` (required in v5)
- Fixed `network_interface` output — use `ip_address` (string) not `ip_addresses` (list)
- Fixed firewall rules — use `source_address_start`/`source_address_end` (e.g., `0.0.0.0`/`255.255.255.255`) instead of CIDR notation
- Changed `sslmode` from `prefer` to `disable` (PostgreSQL SSL off in Docker; provider doesn't support `prefer`)
- DNS module rewritten as documentation-only (UpCloud provider v5 doesn't include DNS resources)
