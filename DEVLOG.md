# Dev Log

## Day 1 — Phase 0: Planning & Foundation

**Date:** 2026-05-21

### Done

- Initialized Next.js 15.5 (App Router), TypeScript, Tailwind CSS 3.4
- Configured ESLint (flat config) + Prettier + `prettier-plugin-tailwindcss`
- Initialized shadcn/ui (`components.json`, neutral theme, CSS variables)
- Added base `Button` component and `lib/utils` (`cn`)
- Created scalable folder structure: `app/(marketing)`, `audit`, `results/[id]`, `components/*`, `lib/*`, `types`, `data`, `tests`
- Vitest + React Testing Library scaffold (`tests/setup.ts`, smoke test)
- `.env.example` with phased env var placeholders
- Root documentation: README, ARCHITECTURE, DEVLOG, and product/engineering markdown stubs

### Decisions

- **Package name `stackaudit`** — npm rejects capital letters; folder remains `StackAudit`.
- **Manual scaffold** — `create-next-app` failed on directory name; pinned `next@15.5.18` (patched 15.x).
- **Tailwind 3 + shadcn new-york** — stable shadcn path; upgrade to v4 later if needed.
- **Placeholder routes** — `/audit` and `/results/[id]` stubbed for Phase 2–3.

### Next

- Phase 1: Landing page (hero, social proof, how-it-works)
- Phase 2: Audit form with tool/plan/spend fields

---

## Day 2 — Phase 1: Core App Setup + Design System

**Date:** 2026-05-22

### Done

- Refined theme tokens (brand accent, success, elevated shadows) in `globals.css` + `tailwind.config.ts`
- Added `lib/design/tokens.ts` for container widths and section spacing
- Built shared layout: `SiteLayout`, `Navbar`, `Footer`, `SkipLink`, `Logo`
- Built responsive `Container`, `Section`, `PageHeader`
- Built typography primitives: `Display`, `Title`, `Lead`, `Eyebrow`, `Text`, `Caption`
- Added shadcn UI: `Card`, `Input`, `Textarea`, `Label`, `Badge`, `Separator`, `Sonner` toaster
- Extended `Button` with `brand` variant and improved focus rings
- Added `FormField` for accessible form composition (Phase 2 ready)
- Added `lib/toast` helper; mounted `<Toaster />` in root layout
- Wired `SiteLayout` across marketing, audit, and results route groups
- Updated landing + stub pages to demonstrate design system
- Tests: `tests/components/container.test.tsx`, `typography.test.tsx`
- Updated README, ARCHITECTURE (UI section), DEVLOG

### Decisions

- **Sonner over custom toast** — shadcn-standard, accessible, minimal API via `lib/toast`
- **No dark mode toggle yet** — CSS variables ready; avoids `next-themes` dependency for now
- **Navbar client component** — `usePathname` for active route styling
- **Landing uses design system** — light marketing sections, not separate landing components yet

### Next

- Phase 2: Audit form (RHF + Zod, `FormField`, tool/plan inputs)

---

## Day 2 — Phase 2: Marketing Landing Page

**Date:** 2026-05-22

### Done

- Centralized copy in `data/landing-content.ts` (hero, features, benefits, workflow, FAQ, CTA)
- Modular landing sections in `components/landing/`:
  - `HeroSection` + `AuditPreview` (screenshot-worthy mock card)
  - `TrustSection` (pills + stats)
  - `FeaturesSection` (6-column responsive grid)
  - `BenefitsSection` (2-up cards with bullet proof points)
  - `WorkflowSection` (3-step workflow)
  - `FaqSection` (accessible accordion)
  - `CtaSection` (conversion-focused closing CTA)
- Updated `Navbar` / `Footer` anchor links (`#features`, `#benefits`, `#workflow`, `#faq`)
- Composed full page in `app/(marketing)/page.tsx`
- Updated `LANDING_COPY.md`, README screenshots section, `docs/screenshots/README.md`

### Decisions

- **Copy in `data/` not CMS** — keeps landing editable without overbuilding
- **Sample audit card in hero** — illustrative UI only; labeled “Sample audit preview”
- **FAQ as lightweight client accordion** — no extra Radix dependency
- **Trust stat footnote** — transparent that $480 benchmark is demo illustrative

### Next

- Phase 3: Audit form (RHF + Zod, tool/plan/spend inputs)

---

## Day 2 (continued) — Phase 3: Audit Form System

**Date:** 2026-05-22

### Done

- `lib/pricing/catalog.ts` — 9 tools, plans, billing types (seat / flat / usage)
- `lib/audit-form/schema.ts` — Zod validation: conditional seats, plan IDs, duplicate tools, draft vs submit schemas
- `lib/audit-form/storage.ts` — localStorage draft (`stackaudit-audit-draft`), debounced auto-save
- `components/form/` — `AuditForm`, `ToolRow`, `FormSelect`, `FormNumberInput`
- `components/ui/select.tsx` — styled native select
- `/audit` page — team size + dynamic tool rows (add/remove up to 15)
- Fields per row: tool, plan, monthly spend, seats (seat-based), use case
- Tests: `tests/audit-form/schema.test.ts`, `storage.test.ts`
- Updated ARCHITECTURE (form flow + validation layers), README features, DEVLOG

### Decisions

- **Catalog separate from engine pricing** — plan labels for UX now; dollar amounts in Phase 4
- **Two Zod schemas** — `auditFormDraftSchema` for localStorage (allows $0 spend); `auditFormSchema` for submit
- **Duplicate tool prevention** — Zod superRefine + disabled options in other rows’ selectors
- **Submit stub** — validates + toast; no audit run until Phase 4
- **Native `<select>`** — accessible, no extra Radix dependency

### Next

- Phase 4: Deterministic audit engine + pricing amounts

---

## Day 3 — Phase 4: Pricing Data Layer

**Date:** 2026-05-23

### Done

- `lib/pricing/types.ts` — `NormalizedTool`, `NormalizedPlan`, `NormalizedPrice`, `PriceSource`
- `lib/pricing/sources.ts` — vendor URL registry with `checkedAt` dates
- `lib/pricing/data/tools.ts` — list prices for 9 tools / all plan tiers
- `lib/pricing/data/index.ts` — `buildPricingCatalog()` + version metadata
- `lib/pricing/models.ts` — `estimateMonthlyListCost`, `formatPrice`, `planRequiresSeatsInput`, …
- `lib/pricing/validate.ts` — catalog integrity validation (sources, plans, tools)
- `lib/pricing/index.ts` — public API + `PRICING_CATALOG` singleton
- Refactored `catalog.ts` to derive form options from normalized data
- Form: seat field now plan-aware (e.g. ChatGPT Team requires seats, Plus does not)
- Tests: `tests/pricing/validate.test.ts`, `models.test.ts`
- Updated `PRICING_DATA.md` (architecture, sources, price tables, update guide)

### Decisions

- **Single edit surface** — prices live in `data/tools.ts`; docs in `PRICING_DATA.md`
- **Source IDs** — every plan links to `PRICING_SOURCES` for auditability
- **Usage plans** — `listPrice.amountUsd: 0` + qualifier; engine uses user-reported spend
- **Catalog singleton** — built at import; validated in tests

### Next

- Phase 5: Deterministic audit engine core (done)
- Phase 5 (continued): Results UI

---

## Day 4 — Phase 5: Audit Engine Core

**Date:** 2026-05-24

### Done

- `lib/audit-engine/types.ts` — Engine types (`AuditInput`, `AuditResult`, `Recommendation`, `AuditSummary`).
- `lib/audit-engine/calculator.ts` — Pure financial math utilities (savings percent, monthly/annual spend, overspend delta).
- `lib/audit-engine/priority.ts` — Scopes recommendations into P1 (highest), P2 (medium), P3 (lowest) and sorts.
- `lib/audit-engine/rules/` — Deterministic financial logic rules:
  - `overspend.ts` — Reported vs. list price (+15% threshold check).
  - `downgrade.ts` — Plan downgrade (business -> pro for small teams).
  - `redundant.ts` — Co-existence of overlapping paid tools (e.g. Cursor + Copilot).
  - `api-switch.ts` — Chat seat subscription -> token API billing arbitrage.
  - `alternative.ts` — Cheaper equivalent tool options (e.g. Windsurf vs. Cursor Pro).
  - `unused-tier.ts` — Seat floor waste (e.g. paying for minimum seat count on Claude Team).
- `lib/audit-engine/engine.ts` — Orchester running all rules, deduplicating findings (keeping highest savings per tool + type pair), sorting and finalizing statistics.
- `lib/audit-engine/index.ts` — Export barrel.
- Exported all audit engine types from `types/index.ts`.
- Tests: Added comprehensive suite of unit/integration tests under `tests/audit-engine/`:
  - `overspend.test.ts`, `downgrade.test.ts`, `redundant.test.ts`, `api-switch.test.ts`, `calculator.test.ts`, `engine.test.ts`
- Verified vitest: All 116 tests passing.
- Updated `ARCHITECTURE.md` to document submodules, design, and data flow.

### Decisions

- **Deterministic & explainable logic** — recommendation reasoning uses predefined string templates with actual pricing data variables; no AI or fuzzy matching in the rules.
- **Rule deduplication** — if multiple rules trigger for the same tool + rule type (e.g. downgrade vs alternative), the orchestrator keeps the recommendation offering the highest financial saving.
- **Priority tiering** — P1 ($50+/mo saving or IDE redundancy), P2 ($20-$49/mo saving or seat floor waste), P3 (<$20/mo saving or alternative tool recommendation).

---

## Day 4 (continued) — Phase 6: Results Experience UX

**Date:** 2026-05-24

### Done

- **Results Page UI/UX** (`app/results/[id]/`) — Built a highly-polished, screenshot-worthy client results layout:
  - `SavingsHero`: Renders a large animated dollar amount of annual savings, and conditional "Already Optimized" fallback state with clean styling.
  - `AuditSummaryBar`: Highlights list price vs. reported spend, tool count, and billing gap.
  - `RecommendationsList`: Organizes findings by priority level (P1 High, P2 Medium, P3 Low) with color-coded dividers.
  - `RecommendationCard`: Features hover transformations, type icons, clear explanation text, and saving pills.
  - `ToolBreakdown`: Displays a table outlining user reported seat counts, spend vs list price, and status indicator badges.
  - `ResultsCta` & `ShareButton`: Connects conditional email/share button components with descriptive sonner toasts.
- **Client Data Flow** — Updated `AuditForm` to trigger the audit engine client-side on submission, serialize results to `sessionStorage` with a fresh UUID, and direct the user to the matching `/results/[id]` path.
- **Hydration & Skeleton Loader** — Added a client-side loading state and a fallback UI if the audit result cannot be loaded.
- **Lint Warning Resolution** — Cleaned up minor typescript-eslint unused variable warnings in both code files and test suites.
- **Mockup Assets** — Generated and configured 4 high-fidelity mock web screenshots under `docs/screenshots/` showing hero, features, workflow, and CTA.

### Decisions

- **Session-storage Bridge** — Kept results data in `sessionStorage` under `stackaudit-result-[uuid]` to cleanly decouple UI presentation from Supabase persistence (Phase 7).
- **Interactive Toasts** — Set up email reports and link sharing with sonner toasts, ensuring buttons are not dead while backend APIs are pending.

### Next

- Phase 7: Supabase integration for persisting audits and leads

---

## Day 4 (continued) — Phase 7: Backend & Database

**Date:** 2026-05-24

### Done

- **Supabase Integration** — Installed `@supabase/supabase-js` client library.
- **Database Schema Migration** (`supabase/schema.sql`) — Structured SQL script to provision the tables:
  - `audits` table storing UUID primary keys, inputs (JSONB), summary (JSONB), and recommendations (JSONB).
  - `leads` table capturing user email addresses, optionally linked to `audits.id`.
  - Configured RLS policies: read-write access for audits, write-only public access for leads (emails remain secure).
- **Client & DB Service Layer** — Created `lib/supabase/client.ts` to instantiate public and admin Supabase client instances. Built `lib/supabase/db.ts` to expose clean database CRUD operations (`insertAudit`, `selectAudit`, `insertLead`).
- **Server Actions** — Formulated Next.js 15 Server Actions:
  - `runAndSaveAuditAction`: Parses inputs with Zod schema, scores the results via `runAudit` server-side, and persists records to the database.
  - `captureLeadAction`: Validates emails and inserts lead contacts.
- **UI Form Integration** — Integrated form mutations:
  - Rewired `AuditForm` to call `runAndSaveAuditAction` on submit.
  - Set up `ResultsPage` (server wrapper) to query the Supabase database directly on the server, speeding up page load speeds and enabling SEO pre-rendering.
  - Configured `ResultsCta` to display a styled text input and submit captured lead emails directly to `captureLeadAction`.
- **Offline Fallback Bridge** — Implemented client-side fallback detection: if Supabase environment variables are missing (e.g. initial dev environment), the app automatically falls back to client-side scoring and `sessionStorage` storage.

### Decisions

- **Server-Side Scoring** — Computing score summaries server-side within the Server Action ensures that calculation results are tamper-proof and verified before database insert.
- **Server Actions over REST API** — Next.js 15 Server Actions provide robust end-to-end type safety directly from the client forms to database queries.
- **Write-Only Leads Policy** — Enabled database RLS policies preventing read access to email leads table by public anon keys.

### Next

- Phase 8: AI Summary (Anthropic API integration + static fallback)
