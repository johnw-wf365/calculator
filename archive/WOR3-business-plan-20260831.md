# WorkForce365.ai — Business Plan

**Version:** 1.0
**Author:** Ava 2 (Business Strategist)
**Date:** 2026-08-31
**Status:** Draft — Ready for executive review

---

## 1. Executive Summary

WorkForce365.ai is a fully agentic company building AI-powered workforce products. Our beachhead product is **OnboardAI** — a deployable AI agent that automates new-hire employee onboarding. It answers policy questions, walks new hires through paperwork, enrolls them in benefits, and hands off to HR only for exceptions.

**Why this, why now:**
- The agentic AI in HCM market is growing from $2.47B (2025) to $4.56B (2026), on track to $13.48B by 2031 (Mordor Intelligence, 2026).
- 62% of organizations are scaling AI agents in at least one function (McKinsey, Nov 2025).
- Enterprise AI workforce platforms are a $4.24B market growing at 32.98% CAGR.
- Current onboarding is broken: paper-based, repetitive, slow. HR teams spend 15–20 hours per new hire on administrative tasks that an agent can do in minutes.
- Onboarding is a universal pain point across every company with employees — large TAM, clear value, fast to demonstrate ROI.

**Financial headline (Year 1):**
- Target: **$360K ARR** by month 12 (conservative), with a path to $1M+ if outbound scales.
- Gross margin: **55%** (inference-aware pricing; in line with AI-native benchmarks per ICONIQ/Bessemer).
- Payback period: **< 6 months** on CAC.

**Ask:** Approve this plan so we can begin execution immediately. Ira's market research (WOR-2) will refine TAM/SAM/SOP numbers in the next 24 hours; this plan uses conservative, publicly-verified market data in the meantime.

---

## 2. Market Analysis

### 2.1 TAM / SAM / SOM

| Layer | Size | Source / Assumption |
|-------|------|---------------------|
| **TAM** | $4.56B (2026) | Agentic AI in HCM market (Mordor Intelligence) |
| **SAM** | $1.14B (2026) | ~25% of agentic HCM = onboarding + employee self-service automation |
| **SOM (Yr 1)** | $360K ARR | 300 paying customers × $100/mo average = $360K ARR |

**Note:** Ira's research (WOR-2) will refine these with primary competitive analysis. Current estimates are top-down; bottom-up validation will come from early customer conversations.

### 2.2 Market Dynamics

- **Growth tailwinds:**
  - Agentic AI platforms & orchestration engines lead the HCM market with 36.47% share (Mordor Intelligence, 2025).
  - 75% lower time-to-fill reported by organizations using AI agents in recruiting (iCIMS, March 2026).
  - Gartner forecasts 40% of enterprise apps will embed task-specific AI agents by end-2026 (up from <5% in 2025).
  - Labor cost inflation (8–10% in IT services) compressing automation ROI payback to 14 months.

- **Buyer behavior:**
  - Mid-market (100–2,000 employees) companies feel SaaS cost sprawl most acutely and are actively seeking automation.
  - 85% of SaaS companies have adopted usage-based pricing (Metronome, 2025) — buyers now expect consumption-aligned cost.
  - Per-seat AI pricing creates structural misalignment: vendor profits when you need more humans, not fewer (alhena.ai, 2026).

### 2.3 Competitive Landscape

| Competitor | Category | Pricing Model | Weakness |
|-----------|----------|---------------|----------|
| **Workday** | Full HCM suite | Per-employee, multi-year | Overkill for SMB/mid-market; slow to deploy |
| **BambooHR** | HRIS for SMB | Per-employee/mo | No native agentic AI; rule-based only |
| **Rippling** | Workforce platform | Per-employee/mo | Broad but shallow; AI bolted on, not native |
| **Leena AI** | AI employee experience | Usage-based, enterprise | Focused on query deflection, not onboarding flow |
| **Paradox (Olivia)** | Conversational AI | Enterprise contract | Narrow to recruiting; not full onboarding |

**Our advantage:** Purpose-built for onboarding workflows, not a chatbot bolted onto an HRIS. Deployable in days, not months. Inference-aware pricing that aligns with customer success (we cost less as we automate more).

---

## 3. Product Definition

### 3.1 OnboardAI — Beachhead Product

**What it is:** A deployable AI agent that handles the first 30 days of a new employee's journey automatically.

**Core capabilities (MVP):**
1. **Welcome & orientation** — Conversational walkthrough of company culture, org chart, tools.
2. **Policy Q&A** — RAG-powered knowledge base from employee handbook, benefits docs, compliance policies.
3. **Paperwork automation** — Digital I-9, W-4, direct deposit, emergency contacts, e-signature.
4. **Benefits enrollment** — Side-by-side plan comparisons, eligibility checks, guided selection.
5. **IT provisioning triggers** — Auto-create tickets in Jira/ServiceNow for laptop, access badges, system accounts.
6. **Manager check-ins** — Scheduled 7/14/30-day check-in prompts for the hiring manager.
7. **HR handoff** — Only escalates exceptions; logs everything for compliance audit trail.

**Technical architecture (for Sam/Max review):**
- Frontend: Chat widget (embeddable in Slack, Teams, or web)
- Agent layer: Orchestration engine with RAG over company documents
- Models: Provider-agnostic (primary: cost-efficient frontier model; fallback: open-weight via self-hosted)
- Integration: REST API + webhook connectors for HRIS (BambooHR, Rippling, Gusto)
- Compliance: SOC 2 Type I by month 6; GDPR-compliant data handling from day 1

**Out of scope for MVP (post-launch roadmap):**
- Multi-language support (Q2)
- Advanced analytics dashboard (Q2)
- Workflow builder for custom onboarding tracks (Q3)
- Employee self-service beyond onboarding (Q3)

### 3.2 Value Proposition

> **"Turn 20 hours of HR admin per new hire into 2 hours — with a better employee experience."**

- **For HR:** Reclaim 80%+ of onboarding admin time. One HR generalist can manage 3× the hiring volume.
- **For new hires:** 24/7 instant answers, no waiting for HR to reply. Consistent experience across cohorts.
- **For IT/ops:** Automated provisioning triggers reduce Day-1 access delays from days to hours.
- **For the CFO:** Direct cost savings of $1,500–$3,000 per hire in recovered HR time (at fully-loaded HR cost of $45–$65/hr).

---

## 4. Financial Projections

### 4.1 Revenue Model

**Pricing: Hybrid (Base + Usage)**

| Tier | Monthly Base | Included Hires | Overage per Hire | Target Segment |
|------|-------------|----------------|-------------------|----------------|
| **Starter** | $49/mo | Up to 10 hires/mo | $5/hire | < 100 employees |
| **Growth** | $199/mo | Up to 50 hires/mo | $4/hire | 100–500 employees |
| **Scale** | $499/mo | Up to 200 hires/mo | $3/hire | 500–2,000 employees |
| **Enterprise** | Custom | Custom volume | Custom | 2,000+ employees |

**Why hybrid over pure per-seat or pure usage:**
- Base subscription provides predictable MRR (investors like this).
- Usage component aligns cost with customer value (more hiring = more cost, but also more value delivered).
- Avoids the per-seat AI trap where vendor profits from more humans, not fewer.

**Assumptions (conservative, sourced):**
- Average revenue per customer: $100/mo starting, expanding to $150/mo by month 12 (conservative; SaaStr benchmarks show $200–$800K ARR in Year 1 for AI SaaS with design partners — we model $360K).
- Gross margin: 55% (inference costs at ~23% of revenue per SaaStr 2025 data; infra + human review at ~22%).
- Net revenue retention: 110% (expansion within existing customers as they hire more).
- Monthly churn: 5% (improving to 3% by month 12 as product deepens).

### 4.2 Year 1 Monthly Projection

| Month | Customers | MRR | MoM Growth | Cumulative Revenue |
|-------|-----------|-----|------------|---------------------|
| M1 (launch) | 5 | $500 | — | $500 |
| M2 | 12 | $1,200 | 140% | $1,700 |
| M3 | 25 | $2,500 | 108% | $4,200 |
| M4 | 45 | $4,500 | 80% | $8,700 |
| M5 | 70 | $7,000 | 56% | $15,700 |
| M6 | 100 | $10,000 | 43% | $25,700 |
| M7 | 130 | $13,000 | 30% | $38,700 |
| M8 | 160 | $16,000 | 23% | $54,700 |
| M9 | 190 | $19,000 | 19% | $73,700 |
| M10 | 220 | $22,000 | 16% | $95,700 |
| M11 | 250 | $25,000 | 14% | $120,700 |
| M12 | 300 | $30,000 | 20% | $150,700 |

**Year 1 ARR at M12 run rate: $360,000**
**Year 1 cumulative revenue: ~$150,700** (conservative ramp; assumes organic + light outbound)

**Note on realism:** SaaStr data shows AI SaaS startups with 3–5 design partners at launch achieve $200K–$800K ARR in Year 1. Our $360K target sits at the conservative end — appropriate given zero initial budget and a 7-day launch window.

### 4.3 Cost Structure (Monthly Burn)

| Category | M1–M3 | M4–M6 | M7–M12 | Notes |
|----------|-------|-------|--------|-------|
| **Inference / API costs** | $200 | $800 | $2,500 | Scales with usage; 23% of revenue benchmark |
| **Infrastructure (cloud)** | $100 | $300 | $800 | PGlite → managed Postgres → scale |
| **Headcount (agents)** | $0 | $0 | $0 | Internal agent team; no cash burn |
| **Marketing** | $0 | $200 | $500 | Organic content, community, then paid |
| **Tools / SaaS** | $50 | $100 | $200 | Monitoring, analytics, CI/CD |
| **Total monthly burn** | **$350** | **$1,400** | **$4,000** | |

**Year 1 total burn: ~$28,500**
**Break-even month: M8** (MRR $16K vs. burn $4K — gross margin covers operating costs by M6; fully cashflow positive by M8).

### 4.4 Unit Economics (Steady State, M12)

| Metric | Value | Industry Benchmark |
|--------|-------|-------------------|
| ARPU | $100/mo | AI SaaS median ~$150/mo |
| CAC | $350 | Content + PLG + outbound blend |
| LTV | $2,000 | ARPU / monthly churn ($100 / 0.05) |
| LTV:CAC | 5.7:1 | Target > 3:1 ✓ |
| Gross margin | 55% | AI-native avg 41–65% ✓ |
| CAC payback | 4 months | Target < 12 months ✓ |
| Monthly burn at M12 | $4,000 | |
| MRR at M12 | $30,000 | |
| Net revenue retention | 110% | Good for early-stage AI SaaS |

---

## 5. Go-to-Market Strategy

### 5.1 Positioning

**"The AI onboarding agent that deploys in an afternoon — not a quarterly IT project."**

Contrast with:
- Workday/SAP: Enterprise HCM requiring 6–18 month implementations.
- Point solutions: Chatbots that only answer questions, don't drive workflows.

### 5.2 Channel Strategy (Zero-Cost Bootstrap First)

**Phase 1 — Proof (Days 1–7): Launch to friendly network**
- Founder (John) introduces us to 5–10 HR leaders in his network.
- Offer 90-day free pilot in exchange for feedback + case study rights.
- Product: MVP deployed within 7 days (Zoe/Sam execute).

**Phase 2 — Organic (Weeks 2–4): Content + community**
- Publish "State of AI Onboarding 2026" report (leverage Ira's research).
- LinkedIn posts from Elon's profile: daily insights on HR automation.
- Guest post on HR Tech Blog, People Matters, Unleash.
- Launch free ROI calculator: "How much is onboarding costing you?"

**Phase 3 — PLG (Month 2–3): Self-serve funnel**
- Free tier: Up to 5 hires/mo (product-led growth engine).
- In-product upgrade prompts when usage hits limits.
- Viral loop: Every new hire invited through OnboardAI sees the brand.

**Phase 4 — Outbound (Month 4+): Sales-assisted**
- Target: HR leaders at 100–500 employee companies.
- Signal-based outreach: Companies posting job hires on LinkedIn = actively growing = onboarding pain.
- Channel: HR tech integrations (BambooHR marketplace, Rippling app store).

**Phase 5 — Scale (Month 6+): Channel + partners**
- HR consulting firms (recommend OnboardAI to their clients).
- ISV partnerships: Embed in HRIS platforms.
- International: EN-first, then localize based on demand.

### 5.3 Pricing Strategy Rationale

- **Starter at $49/mo** is impulse-buy territory for SMB HR leaders (no committee needed).
- **Overage pricing** encourages expansion without penalizing growth.
- **Free tier (5 hires/mo)** removes adoption friction and drives top-of-funnel.
- **Enterprise custom** captures value from large buyers without leaving money on the table.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Model/provider risk** — primary LLM deprecates or hikes prices | Medium | High | Provider-agnostic architecture; maintain evals against 3 providers; migration path < 2 weeks |
| **Inference cost spiral** — token usage grows faster than revenue | Medium | High | Prompt caching (target 40–60%); model routing (cheap model for easy tasks); rate limits per customer |
| **Commoditization** — OpenAI/Anthropic ship onboarding natively | Low (12–24 mo) | High | Moat = workflow depth (paperwork + provisioning + check-ins), not just chat. Vertical distribution through HR integrations. |
| **Slow adoption** — HR is conservative; longer sales cycles than projected | Medium | Medium | Free tier + design partners reduce perceived risk. Case studies from Phase 1. Ira's research validates urgency. |
| **Regulatory** — AI in employment decisions triggers compliance | Medium | Medium | Stay advisory (HR retains decision rights). No automated hiring/firing. SOC 2 by M6. EU AI Act documentation from day 1. |
| **Execution risk** — 7-day launch window is tight | High | Medium | Scope MVP ruthlessly. Cut multi-language, analytics, workflow builder. Ship core onboarding flow only. |
| **Zero budget constraint** — can't spend on ads, tools, events | High | Low | Organic-firstGTM. Leverage John's network. Free tiers of Vercel, GitHub, etc. AI agents are the team — no salary burn. |

---

## 7. Seven-Day Roll-Out Timeline

### Day 1 (Today) — Plan Approval & Kickoff
- [ ] Elon approves business plan
- [ ] Ava shares plan with Leo (PM) for PRD input
- [ ] Ava shares plan with Ira (Research) to refine TAM/SAM/SOM and validate competitive analysis
- [ ] Sam (DevOps) begins tech stack selection
- [ ] Max (Cloud Ops) provisions dev environment

### Day 2 — Product Requirements & Design
- [ Leo delivers PRD: user flows, acceptance criteria, success metrics
- [ ] Zoe scaffolds project repo, CI/CD pipeline
- [ ] Ava + Leo define pricing page copy and onboarding flow
- [ ] Ira publishes market research report (WOR-2)

### Day 3 — Core Build Sprint
- [ ] Zoe: Chat widget + RAG pipeline over uploaded policy docs
- [ ] Sam: Deploy infra (staging environment)
- [ ] Max: Database schema + auth
- [ ] Leo: QA test plan drafted

### Day 4 — Integration & Workflow Build
- [ ] Zoe: Paperwork automation (forms → e-signature)
- [ ] Zoe: Benefits enrollment comparison engine
- [ ] Zoe: IT provisioning webhook (Jira/ServiceNow)
- [ ] Ian begins test case execution on staging

### Day 5 — Manager Flows & Exception Handling
- [ ] Zoe: Manager check-in prompts (7/14/30-day)
- [ ] Zoe: HR escalation queue (exception-only handoff)
- [ ] Zoe: Compliance audit log
- [ ] Ian: Integration testing, edge cases

### Day 6 — QA, Polish & Demo Prep
- [ ] Ian: Full regression pass; sign-off on MVP scope
- [ ] Ava: Draft launch messaging, landing page copy
- [ ] Elon: Prepare demo for friendly network (Phase 1)
- [ ] Mia: Begin content calendar for organic launch (Phase 2)

### Day 7 — Launch 🚀
- [ ] Deploy to production
- [ ] Onboard 3–5 friendly pilot customers from John's network
- [ ] Activate free-tier signup page
- [ ] Monitor inference costs, error rates, user sessions
- [ ] Daily standup: triage feedback, plan M2 features

### Success Criteria (end of Day 7)
- [ ] Product live and processing real onboarding flows
- [ ] 3–5 pilot customers signed up
- [ ] Zero critical bugs
- [ ] Inference cost per hire < $2.00
- [ ] NPS from pilot users collected (target: > 40)

---

## 8. Key Assumptions & Dependencies

### Assumptions (flagged — require validation)
1. Ira's research confirms onboarding as a top-3 pain point for mid-market HR (pending WOR-2).
2. John's network yields at least 5 pilot introductions (confirmed by Elon).
3. Zoe can deliver the core MVP in 5 build days (scoped tightly; Leo to de-risk with detailed PRD).
4. Inference costs remain at current pricing (~$0.002/1K tokens for primary model).
5. No regulatory blocker for AI-assisted onboarding in target market (US-first).

### Dependencies
- **WOR-2 (Ira — Research):** TAM refinement, competitive deep-dive, buyer interview insights → due Day 2.
- **WOR-5 (Sam — DevOps):** Tech stack decision, CI/CD pipeline → due Day 2.
- **WOR-6 (Max — Cloud Ops):** Infrastructure provisioning → due Day 2.
- **WOR-4 (Leo — PM):** PRD, acceptance criteria, success metrics → due Day 2.

---

## 9. Recommendation

**Do this, not that.**

| Do This | Not That |
|---------|----------|
| Launch OnboardAI as a focused onboarding agent | Build a general-purpose "agent platform" (too broad for 7 days) |
| Target 100–500 employee companies (mid-market beachhead) | Sell to enterprise (long cycles, procurement friction) |
| Hybrid base+usage pricing | Pure per-seat (misaligned incentives) or pure usage (unpredictable) |
| Bootstrap with John's network + organic content | Spend on paid ads (zero budget) |
| Ship MVP in 7 days, iterate live | Plan for 3 months and miss the window |

**Why this wins:**
- Onboarding is universally painful, easy to demonstrate ROI, and underserved by AI-native products.
- Our agentic architecture means we can build this fast (agents ARE the team).
- The market is growing at 24%+ CAGR; entering now with a focused product lets us own a beachhead before incumbents react.
- Conservative financials show cashflow positive by M8 with < $30K total burn.

---

## 10. Next Steps

1. **Elon approves this plan** (or requests changes — I will revise within 1 hour).
2. **On approval**, Ava shares the plan with Leo (PM), Ira (Research), Sam (DevOps), and Max (Cloud Ops) as their Day 1 input.
3. **Sam and Max** confirm tech stack by Day 1 EOD.
4. **Leo** delivers PRD by Day 2 EOD.
5. **Execution begins Day 2**, launch Day 7.

**Who acts on this:**
- Elon: Approve plan, unlock execution.
- Leo: Write PRD, own product requirements.
- Ira: Refine market sizing and competitive analysis.
- Sam: Tech stack + CI/CD.
- Max: Infrastructure.

---

*This plan is based on publicly available market data (Mordor Intelligence, McKinsey, Gartner, SaaStr, ICONIQ, Bessemer) and internal company context from WOR-1 onboarding. All projections include stated assumptions. Flag any unverified assumption before acting on it.*
