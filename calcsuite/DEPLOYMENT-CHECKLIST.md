# Deployment Checklist — WOR-1724

**Prepared by:** Zoe (Full-Stack Developer)  
**Date:** 2026-09-14  
**Status:** BLOCKED — Awaiting Human Action

---

## Summary

The CalcSuite calculator platform is code-complete and build-passing. Production deployment requires human action to create external accounts and provide credentials that no agent can create autonomously.

---

## What's Ready ✅

| Item | Status | Details |
|------|--------|---------|
| Next.js 15 app | ✅ Complete | 10 calculators, multi-domain middleware |
| Production build | ✅ Passing | 40+ static pages, 8 API routes |
| Unit tests | ✅ Passing | 19 tests (15 calculator + 4 auth) |
| vercel.json | ✅ Created | Framework config, security headers |
| .env.example | ✅ Created | All required env vars documented |
| Code committed | ✅ Done | Branch `master`, ahead by 7 commits |

---

## What Requires Human Action 🚨

### 1. GitHub Repository
- **Action:** Create `paperclipai/calculator` repo (public)
- **Owner:** John (needs `repo` scope in org)
- **Why:** Vercel deploys from GitHub. The `gh` token for `johnw-wf365` lacks `CreateRepository` permission in `paperclipai` org.

### 2. Vercel Account & Project
- **Action:** Create Vercel account at https://vercel.com, create project `calcsuite`
- **Owner:** John
- **Why:** The Vercel CLI crashes immediately in this environment (`Bus error`). No VERCEL_TOKEN exists in the system.

### 3. Domains
- **Action:** Purchase `calculators.com` and `calculators.co.uk`
- **Owner:** John
- **Estimated cost:** ~$50-60/year total
- **Why:** Can't purchase domains programmatically. Need registrar account.

### 4. Cloudflare Account
- **Action:** Create Cloudflare account, set up DNS zones for both domains
- **Owner:** John
- **Why:** Architecture uses Cloudflare for DNS + CDN + SSL (free tier). No Cloudflare credentials exist.

### 5. Environment Variables
After accounts are created, these need to be set in Vercel:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `openssl rand -base64 32`)
- `AUTH_URL` — Production URL
- `EMAIL_SERVER_*` — SMTP credentials (Resend recommended)
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRICE_ID` — Stripe price ID for £4.99/mo plan

---

## Deployment Steps (Once Unblocked)

1. **Create GitHub repo** `paperclipai/calculator`
2. **Push code:** `cd /opt/paperclip/app/calcsuite && git push` (after adding remote)
3. **Connect to Vercel:** Import project from GitHub
4. **Set env vars** in Vercel dashboard
5. **Deploy:** Vercel auto-deploys on push to `main`
6. **Add domains:** In Vercel → Project Settings → Domains
7. **Configure DNS:** Point domain A/CNAME records to Vercel
8. **SSL:** Vercel provisions automatically once DNS propagates

---

## Architecture Reference

See: `ARCHITECTURE.md` in the calcsuite root for full infrastructure design.

---

## Related Issues

- [WOR-1706] — Technical Architecture & MVP Calculator Build (parent)
- [WOR-1708] — Infrastructure, Deployment & DevOps Pipeline (in_review)
- [WOR-1718] — Create GitHub Repo: paperclipai/calculator (done)
