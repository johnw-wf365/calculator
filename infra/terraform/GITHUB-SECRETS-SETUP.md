# ⚠️ ACTION REQUIRED: Set Up GitHub Secrets

The CI/CD pipeline requires these secrets to be configured in the GitHub repository:

| Secret | Description | How to Obtain |
|--------|-------------|---------------|
| `UPCLOUD_USERNAME` | UpCloud API username | Account: `johnw@workforce365.ai` |
| `UPCLOUD_PASSWORD` | UpCloud API password/token | UpCloud Hub → People → API subaccount |
| `TF_BACKEND_CONN_STR` | PostgreSQL connection string for Terraform state | `postgres://paperclip:PASSWORD@HOST:5432/terraform_state?sslmode=disable` |

## How to Add Secrets

1. Go to the repository on GitHub: `https://github.com/workforce365/paperclip`
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each of the three secrets above

## Connection String Format

For the `TF_BACKEND_CONN_STR`, use:

```
postgres://paperclip:PASSWORD@HOST:5432/terraform_state?sslmode=disable
```

Where:
- `PASSWORD` = the PostgreSQL `POSTGRES_PASSWORD` (from Docker env on the VM)
- `HOST` = the server IP (e.g., `5.22.209.180`) or a hostname that GitHub Actions can reach

**Important**: GitHub Actions runs externally, so `localhost` won't work. You need to either:
- Expose PostgreSQL to the internet (not recommended without SSL/TLS)
- Use a self-hosted runner on the VM
- Use UpCloud Managed PostgreSQL with a public endpoint

## Alternative: Self-Hosted Runner

For security, the recommended approach is to set up a GitHub Actions self-hosted runner on the VM:
- Keeps database credentials internal
- No need to expose PostgreSQL to the internet
- Runner executes workflows locally on the VM

See: https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners
