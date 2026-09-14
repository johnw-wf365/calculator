# React/Next.js + Vercel + Supabase — Claude Code Rules

## Project Overview
This project uses React 19+ with Next.js 15 App Router, deployed on Vercel with Supabase for auth and database.

## Code Style
- Use TypeScript for all new files
- Prefer Server Components unless client interactivity is required
- Use `async/await` over `.then()` chains
- Use named exports over default exports

## React Patterns
- Use React 19+ features (useOptimistic, useActionState, etc.)
- Keep components small and focused
- Use composition over inheritance
- Memoize expensive computations with useMemo

## Next.js Conventions
- App Router: use `app/` directory structure
- Use `loading.tsx` and `error.tsx` for loading/error states
- Implement proper SEO with metadata API
- Use `next/image` for all images
- Implement ISR where appropriate

## Vercel Deployment
- Use environment variables for secrets
- Configure proper headers in `vercel.json`
- Use Edge Functions for low-latency endpoints
- Monitor with Vercel Analytics

## Supabase Integration
- Use Row Level Security (RLS) for all tables
- Generate types from database schema
- Use real-time subscriptions sparingly
- Implement proper error handling for auth flows

## Testing
- Write unit tests with Vitest
- Use Playwright for E2E tests
- Test RLS policies explicitly

## File Structure
```
app/
  layout.tsx
  page.tsx
  loading.tsx
  error.tsx
  api/
    route.ts
components/
  ui/
  features/
lib/
  utils.ts
  supabase/
hooks/
types/
```
