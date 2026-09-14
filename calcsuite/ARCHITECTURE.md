# CalcSuite Technical Architecture

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | SSR for SEO (essential for organic traffic), middleware for domain routing |
| Language | TypeScript | Type safety, fewer runtime errors |
| Styling | TailwindCSS v4 | Rapid development, small bundle |
| Database | PostgreSQL + Drizzle ORM | Relational data, type-safe queries, edge-friendly |
| Auth | NextAuth.js v5 | Email + OAuth, middleware protection |
| Payments | Stripe | Subscriptions, webhooks, customer portal |
| Hosting | Vercel | Edge functions, auto-scaling, preview deploys |
| Monitoring | Vercel Analytics + Sentry | Performance, error tracking |

**Why Next.js over Vite (task brief suggested Vite):**
- Next.js App Router gives SSR/SSG out of the box — critical for SEO (Google must index calculator pages)
- Vite would require manual SSR setup with extra config
- Vercel deployment is zero-config with Next.js
- Middleware for multi-domain routing is built-in

## 2. Multi-Domain Strategy

Single codebase serves all domains via Next.js middleware:

| Domain | Locale | Country | Currency |
|--------|--------|---------|----------|
| calculators.com | en-US | US | USD |
| calculators.co.uk | en-GB | UK | GBP |
| calculators.ca | en-CA | Canada | CAD |
| calculators.com.au | en-AU | Australia | AUD |

Middleware reads `Host` header → maps to locale → rewrites to `/[locale]/...` route.

## 3. Infrastructure

- **Vercel Pro** ($20/mo) for hosting + edge functions
- **Supabase** free tier for PostgreSQL (500MB)
- **Cloudflare** registrar for domains (~$50/yr total)
- **Estimated monthly: ~$25/mo initially**

## 4. CI/CD

- `main` branch → auto-deploy to production
- Pull requests → Vercel preview deployments
- GitHub Actions: `pnpm typecheck` + `pnpm test`
- Lighthouse CI for performance budgets

## 5. Freemium Model

- **Unregistered**: 3 calculations/day (cookie-based)
- **Registered**: 10 calculations/month (email signup)
- **Premium**: £4.99/month unlimited + ad-free (Stripe)

## 6. Calculator Logic

All calculations are pure functions in `src/lib/calculators.ts` — no side effects, locale-aware, unit tested.

## 7. MVP Status

- ✅ Project scaffolded
- ✅ 10 calculators built and tested
- ✅ Multi-domain middleware
- ✅ Freemium gate (cookie-based)
- ✅ AdSense placeholder slots
- ✅ Production build passing (40 static pages)
- ✅ Stripe integration (checkout, webhook, portal)
- ✅ User registration (NextAuth) — in progress
- ⬜ Google AdSense actual integration (needs account)
- ⬜ Blink.new MCP evaluation
