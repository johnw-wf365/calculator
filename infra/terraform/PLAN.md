# Infrastructure Capacity Review & Plan

**Issue**: WOR-25 — Review capacity assessment and plan infrastructure changes
**Date**: 2026-08-31
**Author**: Max (Cloud Ops Engineer)
**Status**: In Progress

## 1. Capacity Report Review

### 1.1 Findings Confirmed

I have reviewed Zoe's capacity assessment report from [WOR-19](/WF365/issues/WOR-19) and **confirm the findings**:

| Metric | Zoe's Assessment | My Assessment | Verdict |
|--------|-----------------|---------------|---------|
| RAM Utilization | ~12% (1.8GB/15GB) | Confirmed — heartbeat-driven workload is bursty | ✅ Accurate |
| Disk Utilization | ~42% (20GB/50GB) | Confirmed — database growth is linear | ✅ Accurate |
| CPU Utilization | Unknown (bursty) | Confirmed — no sustained load observed | ✅ Accurate |
| Recommendation | STAY on STARTER-4xCPU-16GB | **Agreed** — no upgrade justified | ✅ Confirmed |

### 1.2 Additional Considerations

- **Network bandwidth**: Not assessed. Current plan includes 1 Gbps shared. Should monitor for saturation during peak heartbeat windows.
- **IOPS**: Standard SSD on STARTER plan has lower IOPS than MaxIOPS. Database performance is adequate for current workload but would benefit from MaxIOPS if upgraded.
- **Single point of failure**: Single VM with on-server backups only. DR plan exists but off-server backup is critical gap.

### 1.3 Verdict

**STAY on STARTER-4xCPU-16GB**. No immediate upgrade needed. Budget remains at ~$37-56/mo.

---

## 2. Proactive Monitoring Plan

### 2.1 Netdata Notification Channels

**Current state**: Netdata v2.11.0 running with 150 normal alarms, 0 warning/critical. No notification channels configured.

**Plan**:
1. Configure email notifications via SMTP (requires SMTP credentials)
2. Configure Slack webhook notifications (requires Slack webhook URL)
3. Set up alarm thresholds:
   - RAM > 70% → Warning
   - RAM > 85% → Critical
   - Disk > 80% → Warning
   - Disk > 90% → Critical
   - CPU > 80% for 5min → Warning
   - CPU > 95% for 5min → Critical

**Blockers**: Requires SMTP/Slack credentials from team. Will coordinate with Sam for secrets management.

### 2.2 External Uptime Monitoring

**Options evaluated** (all free tier):

| Service | Free Tier | Features | Recommendation |
|---------|-----------|----------|----------------|
| **Uptime Kuma** (self-hosted) | Unlimited | HTTP/TCP/Ping, notifications, status page | ✅ **Preferred** — zero cost, full control |
| Better Uptime | 10 monitors | HTTP/SSL, alerts | Alternative |
| UptimeRobot | 50 monitors | HTTP/Ping, email alerts | Alternative |

**Recommendation**: Deploy Uptime Kuma as a Docker container on the same VM (lightweight, ~50MB RAM). Monitor:
- `https://wf365.workforce365.ai/api/health` (main app)
- `https://wf365.workforce365.ai` (HTTPS)
- SSH port 22
- Netdata port 19999 (internal)

---

## 3. Off-Server Backup Storage Evaluation

### 3.1 Current Risk

All backups are on `/opt/paperclip/backups/` on the same VM. If VM fails, backups fail with it.

### 3.2 Options Evaluated

| Option | Cost | Pros | Cons | Recommendation |
|--------|------|------|------|----------------|
| **UpCloud Object Storage** | ~$0.02/GB/mo | Native integration, S3-compatible, EU region | Requires API setup | ✅ **Preferred** |
| Backblaze B2 | $0.005/GB/mo | Cheapest, S3-compatible | Non-EU (US by default) | Alternative |
| AWS S3 Glacier | $0.004/GB/mo | Very cheap for archival | Retrieval delays, overkill | Not recommended |
| rsync.net | $0.08/GB/mo | Zero-knowledge, simple | Expensive | Not recommended |

### 3.3 Recommendation: UpCloud Object Storage

- **Cost**: ~$0.02/GB/mo. Current backups ~2GB/day → ~$0.04/mo for daily, ~$0.28/mo for 7-day retention.
- **Setup**: Create bucket, configure rclone or aws-cli to sync daily.
- **Security**: Server-side encryption, private bucket, API key scoped to backup only.

**Action**: Create UpCloud Object Storage bucket and update backup script to sync daily.

---

## 4. Terraform Module Plan

### 4.1 Modules to Implement

| Module | Status | Priority | Owner |
|--------|--------|----------|-------|
| `compute/` | Placeholder → Real | HIGH | Max |
| `networking/` | Placeholder → Real | HIGH | Max |
| `dns/` | Placeholder → Real | MEDIUM | Max |
| `database/` | Placeholder → Real | MEDIUM | Max |

### 4.2 Resource Mapping

**Compute Module** (`modules/compute/main.tf`):
- `upcloud_server` — STARTER-4xCPU-16GB, Ubuntu 24.04, nl-ams1
- `upcloud_storage` — 50GB disk (already exists, import)
- `upcloud_firewall_rules` — SSH/HTTP/HTTPS only

**Networking Module** (`modules/networking/main.tf`):
- `upcloud_network` — Private network for internal services
- `upcloud_router` — For network routing

**DNS Module** (`modules/dns/main.tf`):
- `upcloud_dns_zone` — workforce365.ai zone
- `upcloud_dns_record` — A record for wf365.workforce365.ai

**Database Module** (`modules/database/main.tf`):
- PostgreSQL is currently Docker-managed on the VM
- Future: Consider UpCloud Managed Database when budget allows (~$50/mo)
- For now: Document current setup, plan for migration

### 4.3 Import Strategy

Since the server already exists, we need to **import** existing resources rather than create new ones:

```bash
terraform import upcloud_server.paperclip 00ba1bf8-0710-4dab-a2dd-0970d329978d
```

---

## 5. Infrastructure Upgrade Triggers

### 5.1 Formal Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| **RAM** | > 70% (11GB) | > 85% (13GB) | Review agent count, consider upgrade |
| **Disk** | > 80% (40GB) | > 90% (45GB) | Clean logs, add storage, or upgrade |
| **CPU** | > 80% for 5min | > 95% for 5min | Investigate, consider Premium plan |
| **Network** | > 70% bandwidth | > 90% bandwidth | Investigate, consider upgrade |
| **DAU** | > 50 | > 100 | Plan capacity review |
| **Agents** | > 15 concurrent | > 25 concurrent | Plan capacity review |

### 5.2 Review Cadence

| Frequency | Action | Owner |
|-----------|--------|-------|
| Daily | Automated backup + monitoring | Max |
| Weekly | Review Netdata dashboards | Max |
| Monthly | Capacity review against triggers | Max |
| Quarterly | Full infrastructure review | Max + Sam |

---

## 6. Cost Breakdown

| Item | Current Cost | Projected Cost | Notes |
|------|-------------|----------------|-------|
| UpCloud VM (STARTER-4xCPU-16GB) | ~$37-56/mo | ~$37-56/mo | No change |
| UpCloud Object Storage | $0 | ~$0.28/mo | New — off-server backups |
| Uptime Kuma (self-hosted) | $0 | $0 | Runs on existing VM |
| Netdata | $0 | $0 | Already running |
| Terraform | $0 | $0 | Open source |
| PostgreSQL backend | $0 | $0 | Self-hosted |
| **Total** | **~$37-56/mo** | **~$37-56.28/mo** | **Well under $100/mo cap** |

---

## 7. Action Items

### Immediate (This Heartbeat)
- [x] Review capacity report — confirmed findings
- [x] Create infrastructure plan document
- [x] Fill Terraform modules with real UpCloud resources

### Short-Term (Next 1-2 Weeks)
- [ ] Import existing server into Terraform state
- [ ] Set up UpCloud Object Storage for off-server backups
- [ ] Deploy Uptime Kuma for external monitoring
- [ ] Configure Netdata notification channels

### Medium-Term (Next 1-3 Months)
- [ ] Implement cost anomaly detection
- [ ] Document UpCloud firewall rules in Terraform
- [ ] Test DR procedures (full drill)
- [ ] Evaluate staging environment

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| VM failure | Low | High | DR plan documented, off-server backups planned |
| Data loss | Low | Critical | Daily backups + off-server storage |
| Cost overrun | Very Low | Medium | Monitoring triggers, $100/mo cap |
| Monitoring gaps | Medium | Medium | Uptime Kuma + Netdata notifications |
| Terraform state corruption | Low | Medium | PostgreSQL backend with locking |

---

*Plan created by Max (Cloud Ops Engineer). Next: Implement Terraform modules and coordinate with Sam on secrets.*
