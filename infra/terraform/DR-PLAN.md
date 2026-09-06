# Disaster Recovery Plan

**Issue**: WOR-12 — UpCloud Infrastructure Onboarding
**Date**: 2026-08-31
**Author**: Max (Cloud Ops Engineer)
**Status**: Draft — Awaiting Review

## 1. Purpose

This document defines the disaster recovery (DR) procedures for the WorkForce365.ai production infrastructure hosted on UpCloud. It establishes RTO/RPO targets, recovery steps, and verification procedures.

## 2. Scope

### 2.1 In-Scope
- Paperclip AI Server (application + API)
- PostgreSQL database (Paperclip data)
- Hermes Agent (sessions, skills, config)
- Nginx reverse proxy + SSL
- Systemd services
- Backup system

### 2.2 Out-of-Scope
- UpCloud infrastructure (handled by UpCloud SLA 99.999%)
- Client devices
- Third-party APIs (Nous Research, etc.)

## 3. Disaster Scenarios & Response

### 3.1 Scenario: Complete VM Failure (Hardware/Zone Failure)

**Impact**: Total service outage
**RTO**: 30 minutes | **RPO**: 24 hours (last backup)

#### Recovery Steps

1. **Verify failure** (2 min)
   ```bash
   curl -s --connect-timeout 5 https://wf365.workforce365.ai/api/health || echo "DOWN"
   ```

2. **Create replacement server via UpCloud API** (10 min)
   ```bash
   curl -s -u "johnw@workforce365.ai:<TOKEN>" \
     -X POST "https://api.upcloud.com/1.3/server" \
     -H "Content-Type: application/json" \
     -d '{
       "server": {
         "hostname": "paperclip-hermes-2",
         "zone": "nl-ams1",
         "plan": "4xCPU-16GB",
         "storage_devices": {
           "storage_device": [{
             "action": "clone",
             "storage": "01000000-0000-4000-8000-000030060200",
             "title": "paperclip-hermes-2 disk",
             "size": 50,
             "tier": "maxiops"
           }]
         },
         "user_data": "cloud-init-config"
       }
   }'
   ```

3. **Configure firewall rules** (3 min)
   ```bash
   # Allow SSH from management IPs only
   curl -s -u "johnw@workforce365.ai:<TOKEN>" \
     -X PUT "https://api.upcloud.com/1.3/server/<UUID>/firewall_rules" \
     ...
   ```

4. **Restore from latest backup** (10 min)
   ```bash
   # SSH to new server
   scp /opt/paperclip/backups/<latest>/paperclip_db_*.sql.gz root@<NEW_IP>:~/
   scp /opt/paperclip/backups/<latest>/paperclip_data_*.tar.gz root@<NEW_IP>:~/
   
   # Restore PostgreSQL
   zcat paperclip_db_*.sql.gz | docker exec -i paperclip-postgres psql -U paperclip
   
   # Restore Paperclip data
   tar xzf paperclip_data_*.tar.gz -C /
   ```

5. **Restart services** (3 min)
   ```bash
   systemctl start paperclip-postgres
   systemctl start paperclip
   systemctl start nginx
   ```

6. **Verify** (2 min)
   ```bash
   curl -s http://127.0.0.1:3100/api/health
   systemctl list-units --type=service --state=running | grep -E "paperclip|nginx"
   ```

### 3.2 Scenario: Data Corruption / Accidental Deletion

**Impact**: Partial data loss
**RTO**: 15 minutes | **RPO**: 24 hours

#### Recovery Steps

1. Identify last known good backup
2. Stop affected services
3. Restore database from backup
4. Restore Paperclip data from backup
5. Restart services
6. Verify data integrity

### 3.3 Scenario: SSL Certificate Expiry

**Impact**: HTTPS inaccessible
**RTO**: 5 minutes | **RPO**: N/A

#### Recovery Steps
```bash
certbot renew --force-renew
systemctl restart nginx
```

### 3.4 Scenario: DDoS / Brute Force Attack

**Impact**: Degraded performance or lockout
**RTO**: 10 minutes | **RPO**: N/A

#### Response Steps
1. Fail2ban should auto-ban malicious IPs
2. Verify: `fail2ban-client status sshd`
3. If needed, enable UpCloud DDoS protection via API
4. Consider temporary IP whitelist for SSH

## 4. Backup Verification Schedule

| Frequency | Action | Owner |
|-----------|--------|-------|
| Daily | Automated backup runs at 3 AM | Max |
| Weekly | Test restore on staging | Max |
| Monthly | Full DR drill | Max + Sam |
| Quarterly | Review DR plan | Max |

## 5. Contact & Escalation

| Role | Contact | Escalation |
|------|---------|------------|
| Cloud Ops (Max) | Internal | Primary on-call |
| DevOps (Sam) | Internal | CI/CD issues |
| CEO (Elon) | Internal | Budget/security decisions |
| UpCloud Support | support@upcloud.com | Infrastructure failures |

## 6. Recovery Verification Checklist

After any DR execution, verify:

- [ ] `curl -s https://wf365.workforce365.ai/api/health` returns "ok"
- [ ] All systemd services running (paperclip, paperclip-postgres, nginx, fail2ban)
- [ ] PostgreSQL accessible and data intact
- [ ] SSL certificate valid (`openssl s_client -connect wf365.workforce365.ai:443`)
- [ ] Recent sessions restored (check `/opt/paperclip/data/sessions/`)
- [ ] Backups running again on new server
- [ ] Monitoring (Netdata) active

## 7. Improvement Backlog

| Priority | Item | Status |
|----------|------|--------|
| CRITICAL | Off-server backup storage | Pending decision |
| HIGH | Terraform modules (real resources) | Not started |
| HIGH | Automated backup testing | Not started |
| MEDIUM | External uptime monitoring | Not started |
| MEDIUM | Netdata notification channels | Not started |
| LOW | Infrastructure cost anomaly alerts | Not started |
