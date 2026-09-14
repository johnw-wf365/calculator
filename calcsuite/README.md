# CalcSuite — Free Online Calculator Platform

A multi-market calculator platform built with Next.js 15, TypeScript, and TailwindCSS.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Test

```bash
pnpm build     # Production build
pnpm test      # Run unit tests
pnpm typecheck # TypeScript type checking
```

## Project Structure

```
calcsuite/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Dynamic locale segment (en-US, en-GB, en-CA, en-AU)
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── calculators/    # Calculator listing
│   │   │   └── [calculator]/   # Individual calculator pages
│   │   ├── api/usage/          # Freemium usage API
│   │   ├── globals.css         # Tailwind + design tokens
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── calculators/        # 10 calculator UI components
│   │   ├── FreemiumGate.tsx    # Usage limit gate
│   │   └── layout.tsx          # Header, Footer, CalculatorGrid
│   ├── config/
│   │   ├── calculators.ts      # Calculator metadata
│   │   └── domains.ts          # Domain → locale mapping
│   ├── lib/
│   │   ├── calculators.ts      # Pure calculator logic (10 calculators)
│   │   ├── freemium.ts         # Cookie-based usage tracking
│   │   └── db/schema.ts        # Drizzle ORM schema
│   └── middleware.ts           # Domain-based locale routing
├── tests/
│   └── calculators.test.ts     # Unit tests (13 tests)
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Calculators

| Calculator | Status |
|-----------|--------|
| Tip Calculator | ✅ |
| Percentage Calculator | ✅ |
| BMI Calculator | ✅ |
| Age Calculator | ✅ |
| Currency Converter | ✅ |
| Loan / EMI Calculator | ✅ |
| Salary Calculator | ✅ |
| Income Tax Calculator (US/UK) | ✅ |
| Mortgage Calculator | ✅ |
| Retirement Calculator | ✅ |

## Multi-Domain Strategy

Single codebase serves all domains via middleware:

| Domain | Locale | Currency |
|--------|--------|----------|
| calculators.com | en-US | USD |
| calculators.co.uk | en-GB | GBP |
| calculators.ca | en-CA | CAD |
| calculators.com.au | en-AU | AUD |

## Freemium Model

- **Unregistered**: 3 calculations/day (cookie-based)
- **Registered**: 10 calculations/month (email signup)
- **Premium**: £4.99/month unlimited + ad-free (Stripe)

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSR/SSG)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: NextAuth.js v5
- **Payments**: Stripe
- **Testing**: Vitest

## License

Proprietary — WorkForce365.ai
