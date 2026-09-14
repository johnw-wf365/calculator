# Rollout Plan: Calculator Platform Infrastructure

## Phase 1: Planning & Preparation (THIS PHASE)
- [x] Architecture design
- [x] Cost estimate
- [x] Terraform configuration
- [x] CI/CD pipeline design
- [x] Security hardening plan
- [x] Monitoring setup plan

## Phase 2: Human-Provisioned Dependencies (BLOCKED)
- [ ] Purchase domains: .com, .co.uk
- [ ] Create/configure UpCloud account
- [ ] Create Cloudflare account
- [ ] Create GitHub repo for calculator code
- [ ] Create Sentry account for error tracking
- [ ] Provide API credentials to Max via Paperclip secrets

## Phase 3: Infrastructure Provisioning
- [ ] Run Terraform to provision servers
- [ ] Configure Cloudflare DNS
- [ ] Configure Cloudflare CDN/caching
- [ ] SSL certificate setup (Cloudflare Origin CA)
- [ ] Security headers configuration
- [ ] PostgreSQL database setup

## Phase 4: CI/CD Pipeline
- [ ] Configure GitHub Actions secrets
- [ ] Test staging deployment
- [ ] Test production deployment
- [ ] Configure rollback procedures

## Phase 5: Monitoring & Alerting
- [ ] UptimeRobot monitors active
- [ ] Sentry SDK integrated
- [ ] Netdata running on servers
- [ ] Cost anomaly alerts configured

## Phase 6: Testing & Handoff
- [ ] End-to-end deployment test
- [ ] Load test baseline
- [ ] Document runbook
- [ ] Handoff to Zoe (developer) for app deployment
