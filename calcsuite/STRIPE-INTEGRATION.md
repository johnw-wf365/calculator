# Stripe Integration for CalcSuite

## Environment Variables

Copy this to `.env.local` for development or set in your hosting dashboard for production.

```bash
# Required — Stripe API keys
# Get these from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_xxx          # Live secret key (production)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx    # Live publishable key (frontend, optional)
# For testing:
# STRIPE_SECRET_KEY=sk_test_xxx
# STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Required — Stripe webhook signing secret
# Get this from your webhook endpoint in Stripe Dashboard
# https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional — Stripe Price ID for the £4.99/month premium subscription
# Create a Product + Recurring Price in Stripe Dashboard, then copy the Price ID
# If not set, an inline price is created at checkout time (for testing)
STRIPE_PREMIUM_PRICE_ID=price_xxx

# Optional — Enable Stripe automatic tax calculation
# Set to "true" if you have Stripe Tax configured
STRIPE_TAX_ENABLED=true

# Optional — Base URL for redirect URLs (auto-detected on Vercel)
NEXT_PUBLIC_BASE_URL=https://calculators.com

# Optional — Database URL (PostgreSQL)
# If not set, defaults to postgresql://localhost:5432/calcsuite
DATABASE_URL=postgresql://user:password@localhost:5432/calcsuite
```

## Setup Steps

### 1. Create a Stripe Product

1. Go to https://dashboard.stripe.com/products
2. Click **Add Product**
3. Name: **CalcSuite Premium**
4. Description: Unlimited calculations, ad-free, premium features
5. Pricing: **Recurring** → £4.99/month
6. Save and copy the **Price ID** (starts with `price_`)
7. Set `STRIPE_PREMIUM_PRICE_ID=price_xxx` in your environment

### 2. Configure Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. URL: `https://calculators.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Save and copy the **Signing secret** (starts with `whsec_`)
6. Set `STRIPE_WEBHOOK_SECRET=whsec_xxx` in your environment

### 3. Set Up Customer Portal

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Activate the portal
3. Configure allowed actions (update payment method, cancel subscription, etc.)
4. Save

### 4. Run Database Migration

```bash
cd calcsuite
pnpm db:generate
```

This creates the migration SQL for the `users`, `subscriptions`, and `usage_tracking` tables defined in `src/lib/db/schema.ts`.

### 5. Test in Development

```bash
pnpm dev
```

1. Navigate to any calculator
2. Use up the free daily limit (3 calculations)
3. The freemium gate will show the Subscribe button
4. Click Subscribe → redirects to Stripe Checkout (test mode)
5. Use Stripe test card: `4242 4242 4242 4242`
6. After payment, redirects to `/subscription/success`

## API Reference

### POST /api/stripe/checkout

Creates a Stripe Checkout Session.

**Request body:**
```json
{
  "email": "user@example.com",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_xxx"
}
```

### POST /api/stripe/portal

Creates a Stripe Customer Portal session.

**Request body:**
```json
{
  "customerId": "cus_xxx",
  "userId": "optional-user-id",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/...",
  "sessionId": "bps_xxx"
}
```

### POST /api/stripe/webhook

Stripe webhook endpoint (called by Stripe, not by your app).

Handles subscription lifecycle events and updates the database accordingly.

### GET /api/subscription/status

Returns the current user's subscription status.

**Query params:** `userId` or `customerId`

**Response:**
```json
{
  "hasPremium": true,
  "status": "premium",
  "stripeStatus": "active",
  "currentPeriodEnd": "2026-10-14T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "stripeSubscriptionId": "sub_xxx"
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React)                          │
│                                                                  │
│   FreemiumGate ───► /api/stripe/checkout ───► Stripe Checkout    │
│                  │                                               │
│                  ├──► /api/stripe/portal ───► Stripe Portal      │
│                  │                                               │
│                  └──► /api/subscription/status (polling)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Stripe Webhook Handler                        │
│                                                                  │
│   checkout.session.completed → Update user to premium            │
│   customer.subscription.updated → Sync status                   │
│   customer.subscription.deleted → Downgrade to free              │
│   invoice.payment_failed → Mark past_due                         │
└─────────────────────────────────────────────────────────────────┘
```

## Freemium Logic

The gate operates on two layers:

1. **Cookie layer** (`calcsuite_auth`): Set server-side during SSR. Values: `registered`, `premium`.
2. **Stripe layer**: Checked via `/api/subscription/status` on the client. If the user has an active Stripe subscription, the cookie is updated to `premium` for subsequent visits.

**Limits:**
- Unregistered: 3 calculations/day (cookie-based)
- Registered: 10 calculations/month (cookie-based)
- Premium: Unlimited (verified via Stripe + cookie)

## Testing

### Stripe Test Cards

| Card Number          | Scenario                    |
|----------------------|-----------------------------|
| 4242 4242 4242 4242  | Successful payment          |
| 4000 0000 0000 0002  | Payment declined            |
| 4000 0000 0000 3220  | 3D Secure authentication    |

### Manual Testing

```bash
# 1. Start dev server
cd calcsuite && pnpm dev

# 2. Use up 3 calculations on any calculator
# 3. Verify the Subscribe button appears
# 4. Click Subscribe → complete checkout with test card
# 5. Verify success page and premium cookie set
# 6. Verify unlimited calculations work
```

## Production Checklist

- [ ] Live Stripe API keys set (not test keys)
- [ ] Webhook endpoint configured with live signing secret
- [ ] Product and Price created in Stripe Dashboard
- [ ] Customer Portal activated and configured
- [ ] Database migration applied
- [ ] HTTPS enabled (required for Stripe Checkout)
- [ ] `NEXT_PUBLIC_BASE_URL` set to production domain
- [ ] Stripe test mode disabled
