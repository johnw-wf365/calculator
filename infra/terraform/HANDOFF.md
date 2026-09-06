# Infrastructure Handoff Document

**Date**: 2026-08-31
**From**: Paul (Cloud Ops Engineer, departing)
**To**: Max (Cloud Ops Engineer, taking over)
**Status**: Active

## 1. Current Architecture

### 1.1 Cloud Provider
- **Provider**: UpCloud
- **Account**: johnw@workforce365.ai
- **API Base URL**: https://api.upcloud.com/1.3/
- **Authentication**: HTTP Basic Auth (username:token)

### 1.2 Production Server
| Property | Value |
|----------|-------|
| Hostname | paperclip-hermes-1 |
| UUID | `00ba1bf8-0710-4dab-a2dd-0970d329978d` |
| Public IP | 5.22.209.180 |
| Internal IP | 10.5.0.133 |
| Zone | nl-ams1 (Amsterdam) |
| Plan | STARTER-4xCPU-16GB |
| OS | Ubuntu 24.04 LTS |
| Disk | 50GB |
| RAM | 16GB |
| Cost | ~$37-56/mo |

### 1.3 Services Stack
| Service | Port | Status | Description |
|---------|------|--------|-------------|
| Paperclip | 3100 | running | AI control plane |
| PostgreSQL | 5432 (localhost) | running | Database (Docker) |
| Nginx | 80/443 | running | Reverse proxy + SSL |
| Netdata | 19999 | running | Monitoring (v2.11.0-nightly) |
| Fail2ban | - | running | SSH brute-force protection |
| UFW | - | active | Firewall (22/80/443) |

## 2. Backup & Recovery

### 2.1 Current Backup Configuration
- **Schedule**: Daily at 3:00 AM
- **Location**: `/opt/paperclip/backups/`
- **Retention**: 7 days
- **Contents**: PostgreSQL dump + Paperclip data + Hermes config/sessions
- **Script**: `/opt/paperclip/backup.sh`

### 2.2 Backup Script
```bash
#!/bin/bash
set -euo pipefail
BACKUP_DIR="/opt/paperclip/backups"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec paperclip-postgres pg_dump -U paperclip paperclip | gzip > "${BACKUP_DIR}/paperclip_db_${DATE}.sql.gz"
tar czf "${BACKUP_DIR}/paperclip_data_${DATE}.tar.gz" -C /opt/paperclip data
tar czf "${BACKUP_DIR}/hermes_${DATE}.tar.gz" -C /root .hermes
find ${BACKUP_DIR} -type f -mtime +7 -delete
echo "Backup complete: ${DATE}"
```

### 2.3 Gap: Off-Server Backup
- **Risk**: All backups are on the same VM. If VM dies, backups die with it.
- **Status**: Pending decision on off-server backup storage
- **Options**: UpCloud Object Storage, S3-compatible, or alternative

## 3. Monitoring & Observability

### 3.1 Active Monitoring
| Tool | Status | Details |
|------|--------|---------|
| Netdata | running | v2.11.0-nightly, 150 normal alarms, 0 warning/critical |
| Fail2ban | running | SSH jail active |
| Systemd | running | All services monitored |

### 3.2 Monitoring Gaps
- No cost anomaly detection configured
- No uptime external monitoring (Uptime Kuma, Pingdom, etc.)
- No disk-usage alerting beyond Netdata defaults
- Netdata running but no notification channels configured

### 3.3 Network Security
- UFW: Active, default deny incoming, only 22/80/443 open
- UpCloud firewall: Active (rules should be documented)
- Fail2ban: Active on SSH

## 4. Infrastructure as Code

### 4.1 Terraform Status
- **Location**: `/opt/paperclip/app/infra/terraform/`
- **Status**: Modules filled with real UpCloud resources (2026-08-31)
- **Provider**: UpCloud (UpCloudLtd/upcloud ~> 5.0)
- **State Backend**: PostgreSQL (self-hosted, zero cost)
- **CI/CD**: GitHub Actions scaffold exists

### 4.2 Module Ownership
| Module | Owner |
|--------|-------|
| Compute | Max (Cloud Ops) |
| Networking | Max (Cloud Ops) |
| DNS | Max (Cloud Ops) |
| Database | Max (Cloud Ops) |
| CI/CD | Sam (DevOps) |
| Secrets | Shared |

## 5. Critical Procedures

### 5.1 Verify UUID Before Destructive Ops
```bash
curl -s -u "johnw@workforce365.ai:<API_TOKEN>" \
  "https://api.upcloud.com/1.3/server" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for s in data['servers']['server']:
    if s['hostname'] == 'paperclip-hermes-1':
        print(f\"UUID: {s['uuid']}\")
        print(f\"State: {s['state']}\")
"
```
**Expected UUID**: `00ba1bf8-0710-4dab-a2dd-0970d329978d`

### 5.2 Server State Management
- User prefers suspend/resume over stop/start (preserves memory, Chrome tabs, sessions)
- Leave VMs suspended when not in use

### 5.3 Storage Resize
- Resize flow: API expand → growpart → resize2fs
- Payload: `{"storage": {"size": 50}}`

### 5.4 SSH Access
```bash
ssh -i ~/.ssh/paperclip_hermes_upcloud -o StrictHostKeyChecking=no root@5.22.209.180
```

## 6. Budget
- Current run rate: ~$37-56/mo (VM)
- Budget cap: $100/mo
- Netdata: Free (self-hosted)
- Terraform: Free (open source)
- PostgreSQL backend: Free (self-hosted)
- GitHub Actions: Free tier

## 7. Immediate Action Items
1. [ ] Set up off-server backup storage (pending decision)
2. [ ] Configure Netdata notification channels
3. [ ] Implement external uptime monitoring
4. [ ] Document UpCloud firewall rules
5. [ ] Implement cost anomaly detection
6. [ ] Fill Terraform module placeholders with real resources
7. [ ] Create SSH config (~/.ssh/config)
8. [ ] Create DR runbook
9. [ ] Test SSL cert renewal (certbot renew --dry-run)

## 8. Recent Changes (Paul's Era)
| Date | Change |
|------|--------|
| 2026-08-31 | Fixed adapter auto model bug |
| 2026-08-30 | Disk resize 25GB → 50GB |
| 2026-08-30 | Fixed Paperclip config crash |
| 2026-08-30 | Set Hermes identity to Paul |
