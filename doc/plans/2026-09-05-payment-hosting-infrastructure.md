# Payment & Hosting Infrastructure Setup Guide

**Task:** WOR-572 — Set up payment processing and hosting infrastructure  
**Author:** Sam (DevOps Engineer)  
**Date:** 2026-09-05  
**Status:** In Progress — Awaiting human account creation

---

## Overview

This document covers the complete setup for:
1. Payment processing (Stripe + Gumroad)
2. Hosting (Vercel/Netlify)
3. Automated delivery pipelines
4. Purchase-to-delivery flow

## Architecture

```
Customer → Landing Page (Vercel) → Checkout (Gumroad/Stripe)
                                    ↓
                         Webhook → Delivery Server
                                    ↓
                         Email with Product Files
                                    ↓
                         Activity Log (Paperclip)
```

---

## 1. Payment Processing

### 1.1 Gumroad (Primary)

**Why Gumroad first:**
- 10% fee + $0.50/transaction (no monthly fee)
- Built-in digital product delivery (email)
- Built-in affiliate program
- No code required to list products
- Instant payouts

**Setup Steps (requires human action):**

1. Create account at https://gumroad.com
2. Verify email and identity
3. Set up payout method (bank account or PayPal)
4. Create products:
   - Claude Code Rules Pack — $27
   - Prompt Packs — $19-29
   - AI Agent Starter Kit — $49
5. Upload product files (zip of products/files/)
6. Configure email delivery (Gumroad handles this natively)
7. Get API token from https://gumroad.com/settings/advanced
8. Set up webhook URL: https://api.workforce365.ai/webhooks/gumroad

**Gumroad Product Configuration:**

| Product | Price | Variant | File |
|---------|-------|---------|------|
| Claude Code Rules Pack | $27 | Standard | claude-code-rules.zip |
| Prompt Packs | $19 | Basic (50 prompts) | prompt-packs-basic.zip |
| Prompt Packs | $29 | Pro (150 prompts) | prompt-packs-pro.zip |
| AI Agent Starter Kit | $49 | Standard | ai-agent-starter.zip |

### 1.2 Stripe (Backup)

**Why Stripe as backup:**
- Lower fees at scale (2.9% + $0.30)
- More customization
- Better for subscriptions/recurring
- Can handle both one-time and recurring

**Setup Steps (requires human action):**

1. Create account at https://stripe.com
2. Activate account (requires business details)
3. Create products in Stripe Dashboard
4. Set up webhook endpoint
5. Get API keys (pk_*, sk_*)
6. Configure webhook signing secret

**Stripe Product Configuration:**

Use Stripe Price API or Dashboard to create:
- price_claude_code_rules — $27 one-time
- price_prompt_packs_basic — $19 one-time
- price_prompt_packs_pro — $29 one-time
- price_ai_agent_starter — $49 one-time

---

## 2. Hosting

### 2.1 Vercel (Recommended)

**Why Vercel:**
- Free tier sufficient for current scale
- Git integration (auto-deploy on push)
- Edge functions for webhooks
- Custom domain support
- Analytics included

**Setup Steps:**

1. Create account at https://vercel.com
2. Connect GitHub repository
3. Configure project:
   - Framework: Static
   - Root Directory: products/landing
   - Build Command: (none)
   - Output Directory: products/landing
4. Set environment variables:
   - GUMROAD_ACCESS_TOKEN
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
5. Configure custom domain: products.workforce365.ai
6. Deploy

### 2.2 Netlify (Alternative)

**Setup Steps:**

1. Create account at https://netlify.com
2. Connect GitHub repository
3. Configure build settings:
   - Base directory: products/landing
   - Publish directory: products/landing
4. Deploy

---

## 3. Automated Delivery Pipeline

### 3.1 Gumroad Delivery (Automatic)

Gumroad handles delivery automatically:
1. Customer purchases
2. Gumroad processes payment
3. Gumroad sends email with download link
4. Customer downloads files

**No additional infrastructure needed for Gumroad.**

### 3.2 Stripe Delivery (Custom)

For Stripe purchases, we need custom delivery:

1. Customer completes Stripe Checkout
2. Stripe sends webhook to /webhooks/stripe
3. Webhook handler verifies payment
4. Handler triggers email delivery (via SendGrid, Resend, or similar)
5. Customer receives email with download link

### 3.3 Webhook Server

The webhook server (`products/webhooks/delivery.js`) handles:
- Gumroad sale verification
- Stripe payment confirmation
- Activity logging
- Error handling

**Deployment options:**
- Vercel Serverless Function
- Netlify Function
- Paperclip server route
- Standalone microservice

---

## 4. Purchase-to-Delivery Flow

### Complete Flow

```
1. Customer visits products.workforce365.ai
2. Customer clicks "Buy on Gumroad" (or "Pay with Card" for Stripe)
3. Customer completes payment on Gumroad/Stripe
4. Gumroad/Stripe sends webhook to our server
5. Webhook handler:
   a. Verifies payment
   b. Logs sale to Paperclip activity log
   c. Triggers any post-purchase automations
6. Gumroad sends delivery email automatically (for Gumroad)
   OR our server sends delivery email (for Stripe)
7. Customer receives product files
8. Customer gets receipt email
```

### Error Handling

- Payment failed: Customer sees error, no delivery
- Webhook failed: Retry 3x, then alert team
- Email bounced: Log and flag for manual follow-up
- File download expired: Customer contacts support

---

## 5. Environment Variables

### Required

| Variable | Source | Purpose |
|----------|--------|---------|
| GUMROAD_ACCESS_TOKEN | Gumroad settings | API access |
| STRIPE_SECRET_KEY | Stripe dashboard | API access |
| STRIPE_WEBHOOK_SECRET | Stripe webhook settings | Verify webhooks |
| PAPERCLIP_API_URL | Paperclip settings | Activity logging |
| PAPERCLIP_API_KEY | Paperclip settings | Activity auth |

### Optional

| Variable | Source | Purpose |
|----------|-----------------|
| SENDGRID_API_KEY | SendGrid | Email delivery (Stripe) |
| RESEND_API_KEY | Resend | Email delivery (Stripe) |
| SLACK_WEBHOOK_URL | Slack | Sale notifications |
| TELEGRAM_BOT_TOKEN | Telegram | Sale notifications |

---

## 6. Cost Estimate

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| Gumroad | $0 | 10% per transaction |
| Stripe | $0 | 2.9% + $0.30 per transaction |
| Vercel | $0 | Free tier |
| Netlify | $0 | Free tier |
| Domain | ~$10/year | workforce365.ai |
| Email delivery | $0 | Gumroad handles it |
| **Total fixed** | **$0** | Pay per transaction |

---

## 7. Security Considerations

- Never store API keys in code
- Use environment variables for all secrets
- Verify all webhooks (signature validation)
- Rate limit webhook endpoints
- Log all transactions for audit trail
- Use HTTPS everywhere
- Implement idempotency for payment processing

---

## 8. Next Steps (Human Action Required)

1. **Create Gumroad account** — https://gumroad.com
2. **Create Stripe account** — https://stripe.com
3. **Create Vercel account** — https://vercel.com
4. **Configure DNS** — Point products.workforce365.ai to Vercel
5. **Provide API keys** — Share GUMROAD_ACCESS_TOKEN and STRIPE_SECRET_KEY with Sam for configuration
6. **Test purchase flow** — Buy each product and verify delivery

---

## 9. Files Created

```
products/
├── landing/
│   ├── index.html          # Product landing page
│   └── vercel.json         # Vercel deployment config
├── products/
│   └── catalog.md          # Product catalog definition
├── webhooks/
│   └── delivery.js         # Gumroad + Stripe webhook handler
├── files/
│   ├── claude-code-rules/  # Product files for Rules Pack
│   │   ├── README.md
│   │   └── claude-md-react-nextjs.md
│   ├── prompt-packs/       # Product files for Prompt Packs
│   │   ├── README.md
│   │   └── email-marketing.md
│   └── ai-agent-starter/   # Product files for Starter Kit
│       └── README.md
└── .github/workflows/
    └── products.yml        # CI/CD pipeline for product site
```

---

## 10. Related

- [[Simplified-Business-Plan]] — Business plan with product details
- [[WOR-569-Digital-Product-Validation]] — Demand validation research
- [[DevOps-Notes]] — Sam's infrastructure notes
- [[Staging-Environment]] — Staging environment setup
