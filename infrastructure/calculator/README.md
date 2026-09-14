# Calculator Platform Infrastructure

**Issue:** WOR-1708
**Author:** Max (Cloud Ops Engineer)
**Date:** 2026-09-14
**Status:** Plan Complete — Awaiting Approval

## Overview

Infrastructure plan for the WorkForce365.ai calculator platform targeting US, UK, CA, AU markets.

**Budget:** Under £100/month initially

## Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   CDN + DNS     │
                    │   (Free Tier)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   UpCloud LB    │
                    │   (if needed)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼─────┐  ┌────▼────────┐
     │  Staging   │  │ Production │  │  Future:    │
     │  (dev-*)   │  │ (www.*)    │  │  CA, AU     │
     │  ~$10/mo   │  │  ~$25/mo   │  │  expansion  │
     └────────────┘  └────────────┘  └─────────────┘
```

## Cost Estimate (Monthly)

| Service | Provider | Cost |
|---------|----------|------|
| Production Server (2xCPU-4GB) | UpCloud | ~£18 |
| Staging Server (1xCPU-2GB) | UpCloud | ~£10 |
| PostgreSQL (managed/self-hosted) | UpCloud/Docker | £0 (self-hosted) |
| CDN + DNS + SSL | Cloudflare Free | £0 |
| Uptime Monitoring | UptimeRobot Free | £0 |
| Error Tracking | Sentry Free | £0 |
| CI/CD | GitHub Actions Free | £0 |
| **Total** | | **~£28/mo** |

Well under the £100/mo cap.

## Repository Structure

```
infrastructure/calculator/
├── README.md                 # This file
├── terraform/
│   ├── main.tf               # UpCloud provider setup
│   ├── variables.tf          # Configuration variables
│   ├── staging.tf            # Staging environment
│   ├── production.tf         # Production environment
│   └── outputs.tf            # Output values
├── github-actions/
│   ├── ci.yml                # PR checks and testing
│   ├── deploy-staging.yml    # Staging deployment
│   └── deploy-prod.yml       # Production deployment
├── monitoring/
│   ├── netdata.conf          # Netdata monitoring
│   ├── uptime-robot.json     # Uptime monitoring config
│   └── alerts.yml            # Alert rules
└── scripts/
    ├── setup-server.sh       # Initial server setup
    ├── deploy.sh             # Deployment script
    └── rollback.sh           # Rollback script
```

## Security

- SSL/TLS via Cloudflare (Flexible SSL → Full Strict)
- HSTS headers
- CSP headers
- Fail2ban on servers
- UFW firewall (only 80, 443, 22)
- Automated security updates
- No secrets in plain text — Paperclip secrets manager

## Monitoring

| Tool | Purpose | Cost |
|------|---------|------|
| Netdata | Server monitoring | Free |
| UptimeRobot | Uptime monitoring (50 monitors) | Free |
| Sentry | Error tracking (5k events/mo) | Free |
| Cloudflare Analytics | CDN/performance | Free |

## Scaling Strategy

1. **Phase 1 (current):** Single UpCloud server, self-hosted PostgreSQL
2. **Phase 2 (10k+ users/day):** Separate DB server, add staging
3. **Phase 3 (50k+ users/day):** Horizontal scaling with load balancer
4. **Phase 4 (CA/AU):** Multi-region deployment

## Blockers — Human Action Required

1. **UpCloud account access** — Need API credentials for Terraform
2. **Domain purchase** — .com and .co.uk domains needed
3. **Cloudflare account** — DNS and CDN setup
4. **GitHub repo** — Need repo for the calculator code
5. **Sentry account** — Error tracking setup

## Next Steps

1. Approve this plan
2. Provide credentials/access for blocked items
3. Terraform configs can be tested against staging once access is granted
