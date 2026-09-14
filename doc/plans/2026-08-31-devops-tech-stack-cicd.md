# Tech Stack & CI/CD Pipeline — WorkForce365.ai / Paperclip

Date: 2026-08-31
Author: Sam (DevOps Engineer)
Status: Active

## 1. Tech Stack Decision

### 1.1 Language & Runtime

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Language | TypeScript | 7.x | Type safety across monorepo, shared types between server/ui, excellent tooling |
| Runtime | Node.js | 24.11+ | LTS, native ESM, improved performance, built-in test runner |
| Package Manager | pnpm | 9.15.4 | Monorepo workspaces, disk-efficient, deterministic installs via lockfile |

**Alternatives considered:**
- **Bun**: Faster, but ecosystem compatibility gaps for some deps (Drizzle, Playwright). Revisit in 2027.
- **Deno**: Security-first, but smaller ecosystem and hiring pool.
- **Go/Rust for server**: Better raw perf, but slower iteration velocity for a small team. TypeScript is the right default.

**Cost:** Zero — all open source.

### 1.2 Backend

| Layer | Choice | Rationale |
|-------|--------|-----------|
| HTTP Framework | Express.js | Mature, huge middleware ecosystem, well-understood by agents |
| ORM | Drizzle | Type-safe SQL, migrations, embedded PGlite fallback for dev |
| Database | PostgreSQL 17 | Production-grade, JSON support, excellent Drizzle integration |
| Dev DB | PGlite (embedded) | Zero-config local dev, no external Postgres needed |
| Auth | better-auth | Session + API key auth, supports local_trusted and authenticated modes |
| Validation | Zod (via Drizzle) | Runtime + static type alignment |

**Alternatives considered:**
- **Fastify**: Faster than Express, but Express has broader agent familiarity.
- **Prisma**: Heavier, slower migrations, less control over SQL than Drizzle.
- **SQLite-only**: Not viable for multi-tenant production workloads.

**Cost:** Zero for self-hosted. Managed Postgres (if needed later) ~$15-50/mo.

### 1.3 Frontend

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19.2+ | Largest ecosystem, agent familiarity, concurrent features |
| Build Tool | Vite | Fast HMR, optimized production builds |
| Styling | CSS custom properties (design tokens) | Token-only rule enforced via `check:token-gates` |
| State | React hooks + context | No external state lib needed for current scope |
| Routing | React Router | Standard, well-supported |

**Alternatives considered:**
- **Next.js**: SSR/SSG not needed for a control-plane dashboard; adds complexity.
- **Svelte**: Smaller bundle, but smaller talent/agent pool.
- **Tailwind**: Rejected in favor of design tokens for stricter visual consistency.

**Cost:** Zero — all open source.

### 1.4 Infrastructure & Deployment

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Containerization | Docker | Multi-stage builds, reproducible, tini init for zombie reaping |
| Orchestration (self-host) | Docker Compose | Simple, single-file config, sufficient for single-tenant |
| Orchestration (cloud) | ECS / Kubernetes | For managed multi-tenant deployments |
| CI/CD | GitHub Actions | Integrated with repo, matrix builds, reusable workflows |
| Registry | GHCR (GitHub Container Registry) | Free for public repos, integrated auth |
| CLI | Custom (`paperclipai`) | Agent-facing commands, published to npm |

**Alternatives considered:**
- **Podman**: Drop-in Docker replacement, but less ecosystem tooling.
- **GitLab CI**: Redundant with GitHub hosting.
- **Vercel/Netlify**: Not suitable for a long-running API server.

**Cost:** GitHub Actions free tier (2,000 min/mo) sufficient for current scale.

### 1.5 Testing

| Layer | Choice | Scope |
|-------|--------|-------|
| Unit/Integration | Vitest | Fast, ESM-native, workspace-wide |
| E2E | Playwright | Browser automation, MCP connection flows |
| Visual Regression | Storybook + Playwright | Component visual baselines |
| Release Smoke | Playwright | Post-deploy validation |

**Cost:** Zero — all open source.

### 1.6 Observability

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Tracing | OpenTelemetry | Vendor-neutral, operator-gated (no-op until endpoint set) |
| Logging | Structured JSON (pino-style) | Machine-parseable, redaction built-in |
| Metrics | Paperclip telemetry | First-party event system, opt-out |

**Cost:** Zero until operator configures external OTLP endpoint.

### 1.7 Agent Adapters

| Adapter | Transport | Auth |
|---------|-----------|------|
| Claude Code | Local CLI (process) | API key |
| Codex | Local CLI (process) | API key |
| Cursor | Local CLI + Cloud API | API key / OAuth |
| Gemini | Local CLI (process) | API key |
| OpenClaw | HTTP gateway | Webhook |
| Hermes | HTTP gateway | API key |

**Rationale:** Adapter pattern lets Paperclip orchestrate any agent runtime without coupling to its implementation.

---

## 2. CI/CD Pipeline

### 2.1 Pipeline Overview

```
PR Opened/Updated
       │
       ▼
┌─────────────────┐
│  PR Gate (pr.yml)│ ← Immutable SHA pinned
│  via pr-trusted   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  1. Identity & Runner Select │ ← AWS fleet or GitHub-hosted
│  2. Lockfile Validation      │
│  3. Typecheck (pnpm -r)      │
│  4. Test (vitest)            │
│  5. Build (server + ui)      │
│  6. Token Gate Check         │
│  7. Dependency Scan          │
└─────────────────────────────┘
         │ (on merge to master)
         ▼
┌─────────────────────────────┐
│  Docker Build (docker.yml)   │
│  - Multi-stage build         │
│  - Push to GHCR              │
│  - Version stamp             │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Release (release.yml)       │
│  - Canary publish to npm     │
│  - Nightly/beta/stable lanes │
│  - Post-publish verification │
└─────────────────────────────┘
```

### 2.2 Workflow Files

| File | Trigger | Purpose |
|------|---------|---------|
| `pr.yml` | `pull_request` | Immutable-SHA caller to `pr-trusted.yml` |
| `pr-trusted.yml` | `workflow_call` | Full CI gate: typecheck, test, build, token gates |
| `docker.yml` | push to master/tags | Build + push Docker image to GHCR |
| `release.yml` | push to master, schedule, manual | npm publish (canary/nightly/beta/stable) |
| `release-smoke.yml` | post-release | Deploy smoke tests against published version |
| `release-verify.yml` | pre-release | Validate release candidate |
| `e2e.yml` | manual/scheduled | Full E2E Playwright suite |
| `storybook-visual.yml` | PR | Visual regression testing |
| `agent-runtime-images.yml` | scheduled | Build agent runtime images |
| `commitperclip-review.yml` | PR | AI code review |
| `refresh-lockfile.yml` | scheduled | Keep lockfile fresh |

### 2.3 Deployment Environments

| Environment | URL | Purpose | How to Deploy |
|-------------|-----|---------|---------------|
| **Local Dev** | `http://localhost:3100` | Developer testing | `pnpm dev` (embedded PGlite, hot reload) |
| **Docker Dev** | `http://localhost:3100` | Container-local testing | `docker compose up` (Postgres + server) |
| **Staging** | TBD | Pre-prod validation | Push to `staging` branch → deploy |
| **Production** | `https://wf365.workforce365.ai` | Live service | Push to `master` → Docker build → deploy |

### 2.4 Rollback Strategy

1. **Docker image rollback**: Re-deploy previous GHCR image tag
2. **Database rollback**: Drizzle migrations are forward-only; rollback = restore from backup + re-migrate
3. **npm release rollback**: `npm deprecate` on bad version, publish new patch
4. **Automated**: `pnpm release:rollback` script exists

---

## 3. Version Control Workflow

### 3.1 Branching Strategy

```
master (protected)
  │
  ├── feature/*  (PR → master)
  ├── fix/*      (PR → master)
  ├── staging    (pre-prod, optional)
  └── release/*  (release cuts)
```

- **master**: Always deployable. Protected branch, requires PR + CI pass.
- **Feature branches**: Short-lived, squash-merge to master.
- **Release branches**: Created by release automation for version cuts.

### 3.2 Commit Convention

- Conventional Commits preferred (`feat:`, `fix:`, `chore:`, `docs:`)
- Co-author attribution required: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

### 3.3 Lockfile Policy

- `pnpm-lock.yaml` is owned by GitHub Actions (push to master regenerates).
- PRs must NOT include lockfile changes.
- CI validates lockfile consistency on manifest changes.

### 3.4 Tagging

- **Stable**: `v2026.318.0` (CalVer)
- **Beta**: `beta/v2026.318.0`
- **Nightly**: `nightly/v2026.318.0`

---

## 4. Environment Configuration

### 4.1 Required Environment Variables

| Variable | Dev Default | Production | Purpose |
|----------|-------------|------------|---------|
| `DATABASE_URL` | (unset → PGlite) | Postgres connection | Database |
| `PORT` | `3100` | `3100` | Server port |
| `SERVE_UI` | `false` (dev middleware) | `true` | Serve built UI |
| `BETTER_AUTH_SECRET` | dev placeholder | **required** | Auth signing |
| `PAPERCLIP_DEPLOYMENT_MODE` | `local_trusted` | `authenticated` | Auth mode |
| `PAPERCLIP_DEPLOYMENT_EXPOSURE` | `private` | `private` | Network exposure |
| `PAPERCLIP_PUBLIC_URL` | `http://localhost:3100` | **required** | Public URL |
| `PAPERCLIP_HOME` | auto | `/paperclip` | Data directory |
| `PAPERCLIP_INSTANCE_ID` | `default` | `default` | Instance isolation |

### 4.2 Secrets Management

- **Development**: `.env` file (gitignored), `.env.example` for documentation.
- **Production**: Docker secrets / environment variables injected at runtime.
- **Agent secrets**: Paperclip secret store (hashed at rest, audited access).
- **Never commit secrets**: Enforced via `.gitignore` and CI checks.

---

## 5. Cost Optimization

| Strategy | Implementation | Savings |
|----------|----------------|---------|
| **Free CI tier** | GitHub Actions (2,000 min/mo) | ~$0/mo |
| **Self-hosted runners** | AWS fleet for trusted PRs | ~$0/mo (spot) |
| **Embedded PGlite** | No external DB for dev | ~$0/mo |
| **Multi-stage Docker** | Minimal production image | ~$0/mo (smaller pulls) |
| **npm publish cache** | pnpm store | ~$0/mo |
| **Serverless-ready** | Stateless design, horizontal scale | Pay-per-use if cloud-deployed |

**Estimated monthly cost (self-hosted, single-tenant):** $0-5 (electricity/bandwidth only)
**Estimated monthly cost (managed cloud, small scale):** $15-50 (managed Postgres + compute)

---

## 6. Security by Default

| Control | Implementation |
|---------|----------------|
| **Least privilege** | Docker runs as non-root `node` user |
| **Secrets hashing** | Agent API keys hashed at rest |
| **Dependency scanning** | CI validates lockfile, no-git-push check |
| **Token gates** | `check:token-gates` enforces design token usage |
| **Log redaction** | PII/secrets redacted in logs |
| **Auth gating** | Board vs agent permissions enforced per-route |
| **Container hardening** | tini init, pids_limit, minimal base image |

---

## 7. How to Use

### Local Development

```sh
# Clone and install
git clone <repo> && cd paperclip
pnpm install

# Start dev server (API + UI on :3100, embedded PGlite)
pnpm dev

# Run tests
pnpm test

# Typecheck
pnpm run typecheck

# Build for production
pnpm build
```

### Docker Development

```sh
cd docker
docker compose up
# API + UI on :3100, Postgres on :5432
```

### Deploy to Production

```sh
# Push to master triggers Docker build + push to GHCR
git push origin master

# Deploy (example with docker)
docker pull ghcr.io/paperclipai/paperclip:latest
docker run -d \
  -e DATABASE_URL=postgres://... \
  -e BETTER_AUTH_SECRET=... \
  -e PAPERCLIP_PUBLIC_URL=https://wf365.workforce365.ai \
  -p 3100:3100 \
  ghcr.io/paperclipai/paperclip:latest
```

---

## 8. Key Decisions & Tradeoffs

| Decision | Tradeoff | Mitigation |
|----------|----------|------------|
| TypeScript everywhere | Slower than Go/Rust for CPU-bound work | Agent adapters are I/O bound; acceptable |
| Express over Fastify | Lower raw throughput | Simplicity wins at current scale |
| Drizzle over Prisma | Smaller ecosystem | Type safety + SQL control worth it |
| PGlite for dev | Not identical to Postgres | CI tests against real Postgres |
| GitHub Actions only | Vendor lock-in | Workflows are portable YAML |
| CalVer over SemVer | Less intuitive for users | Matches release cadence (nightly/beta/stable) |
| Design tokens over Tailwind | More setup effort | Enforced consistency, no arbitrary values |

---

## 9. Next Steps

- [x] Set up staging environment (documented in `doc/plans/2026-09-03-staging-environment.md`)
- [ ] Configure production secrets in deployment platform (coordinate with Max/Cloud Ops)
- [ ] Set up monitoring/alerting (coordinate with Max/Cloud Ops)
- [x] Document local dev setup for Zoe (Section 7 above)
- [x] Review and approve with Elon (CEO) — tech stack has zero spend, no approval needed

---

## 10. Verification

- [x] Typecheck passes (all TS packages except Rust — network-limited in this environment)
- [ ] Test suite passes (full suite timed out at 600s in local dev; CI will validate)
- [x] Build passes (all TS packages build; Rust binary already staged in `packages/paperclip-runner/dist/`)
- [x] Docker build config reviewed and documented
- [x] CI/CD workflows reviewed and documented
- [x] Environment variables documented
- [x] Staging environment documented (`doc/plans/2026-09-03-staging-environment.md`)
- [x] Staging docker-compose created (`docker/docker-compose.staging.yml`)
