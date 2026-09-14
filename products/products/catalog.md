# Product Catalog — WorkForce365.ai Digital Products

This file defines all digital products available for sale. Used by:
- Landing page (products/landing/index.html)
- Webhook handlers (products/webhooks/delivery.js)
- Gumroad/Stripe product configuration

## Products

### 1. Claude Code Rules Pack
- **ID:** claude-code-rules
- **Price:** $27 one-time
- **Gumroad slug:** (to be configured)
- **Files:** products/files/claude-code-rules/
- **Description:** Curated CLAUDE.md configuration packs for specific developer verticals
- **Includes:**
  - React/Next.js + Vercel + Supabase pack
  - Enterprise compliance pack
  - DevOps automation pack
  - Monthly update eligibility

### 2. Prompt Packs
- **ID:** prompt-packs
- **Price:** $19-29 one-time (tiered by pack size)
- **Gumroad slug:** (to be configured)
- **Files:** products/files/prompt-packs/
- **Description:** Niche-specific prompt systems for professional workflows
- **Includes:**
  - 50-100 curated prompts per pack
  - Documentation + example outputs
  - Multiple niche categories
  - Commercial use license

### 3. AI Agent Starter Kit
- **ID:** ai-agent-starter
- **Price:** $49 one-time
- **Gumroad slug:** (to be configured)
- **Files:** products/files/ai-agent-starter/
- **Description:** Complete "build your first AI agent" kit
- **Includes:**
  - Production-ready agent configs
  - MCP server setups
  - Workflow templates
  - Step-by-step video tutorials

## Delivery Method

All products are delivered via:
1. **Gumroad** — primary payment processor (10% fee + $0.50/transaction)
2. **Stripe** — backup processor (2.9% + $0.30/transaction)
3. **Email** — automated delivery via Gumroad's built-in email delivery

## Webhook Endpoints

Configure these in Gumroad/Stripe dashboard:
- Gumroad: POST /webhooks/gumroad
- Stripe: POST /webhooks/stripe

## Environment Variables Required

- GUMROAD_ACCESS_TOKEN — Gumroad API access token
- GUMROAD_PRODUCT_PREFIX — Product prefix for Gumroad URLs
- STRIPE_SECRET_KEY — Stripe secret key
- STRIPE_WEBHOOK_SECRET — Stripe webhook signing secret
- DELIVERY_EMAIL — From address for delivery emails
