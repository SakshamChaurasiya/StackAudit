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

---

## Day 5 — Phase 8: AI Summary System

**Date:** 2026-05-25

### Done

- **Gemini Integration** — Installed `@google/generative-ai` SDK. Created `lib/ai/gemini.ts` to initialize the `GoogleGenerativeAI` client using `GEMINI_API_KEY` env var. Uses `gemini-1.5-flash` model for fast, cost-effective text generation. Full error handling returns `null` on any failure.
- **Prompt Engineering** (`lib/ai/prompt.ts`) — Built a structured prompt builder that injects: tool names + plans + spend, team size, total monthly spend, potential savings, and top 2 recommendations from the deterministic engine. Explicit constraints: 80–120 words, no invented numbers, plain paragraph output.
- **Deterministic Fallback** (`lib/ai/fallback.ts`) — Zero-API fallback summary generator. Produces an accurate, meaningful summary from engine data alone. Two variants: savings-available summary and already-optimized summary.
- **Public AI Index** (`lib/ai/index.ts`) — `generateSummary(result)` tries Gemini first, falls back automatically. Returns `{ text, isAiGenerated }` so the UI can distinguish and display the correct badge.
- **Database Schema** — Added `ai_summary TEXT` column to `audits` table. Includes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for migration safety on existing databases.
- **DB Layer** (`lib/supabase/db.ts`) — Added `updateAuditSummary(id, text)` helper to persist generated summary. Updated `selectAudit` to select `ai_summary` and return it in `AuditResult`.
- **Type System** (`lib/audit-engine/types.ts`) — Added `aiSummary?: string` and `isAiGenerated?: boolean` to `AuditResult`.
- **Server Action** (`app/actions/audit.ts`) — Wired `generateSummary` after audit insert, persists via `updateAuditSummary`. Inner try/catch ensures summary failure is non-fatal — audit save always succeeds.
- **AI Summary Card** (`components/results/ai-summary-card.tsx`) — Branded results card with gradient border, Sparkles icon, and conditional "AI Summary" / "Quick Summary" badge. "Powered by Gemini" label when AI-generated.
- **Results Page** — `AiSummaryCard` renders between `SavingsHero` and `SummaryBar` when `aiSummary` is present.
- **Documentation** — Updated `PROMPTS.md` (v1 Gemini prompt, AI usage policy, versioning table), `DEVLOG.md`, `README.md` (Gemini in tech stack, AI features section, setup step 5), `.env.example` (GEMINI_API_KEY).

### Decisions

- **Gemini over Anthropic** — Switched from original Anthropic placeholder to Gemini 1.5 Flash based on user preference. Free daily quota covers development and moderate production load.
- **Non-blocking summary** — AI summary generation is wrapped in an inner try/catch so audit persistence is never blocked by AI failures.
- **Post-insert update pattern** — Audit is inserted first (gets a UUID), then summary is generated and written back via UPDATE. Simpler than pre-generating and more resilient.
- **Fallback always ships** — The deterministic fallback ensures every user always sees a meaningful summary, even in local dev without a Gemini key.

### Next

- Phase 9: Email notifications (Resend integration)

---

## Day 5 (continued) — Phase 9: Lead Capture + Email Flow

**Date:** 2026-05-25

### Done

- **Resend Integration** (`lib/email/resend.ts`) — Installed `resend` SDK. Initialized `Resend` client from `RESEND_API_KEY`. Exported `isResendConfigured()` and a typed `sendEmail()` wrapper that never throws — returns `{ success, error? }` on any failure.
- **Email Templates** — Two branded HTML email templates:
  - `lib/email/templates/confirmation.ts` — Confirmation email to the submitter with personalized savings figures, results page link, and "no invented numbers" constraint baked in.
  - `lib/email/templates/notification.ts` — Internal lead alert email to the site owner with lead details, audit stats grid (spend, savings, tools, recommendations), and direct audit link.
- **Public Email Index** (`lib/email/index.ts`) — `sendLeadEmails(lead, summary)` fires both emails in parallel via `Promise.allSettled`. Non-fatal: individual send failures are logged but never propagate. No-op if `RESEND_FROM_EMAIL` is not set.
- **Anti-Spam / Rate Limiting** (`lib/supabase/db.ts`) — Added `hasRecentLead(email, windowMinutes)` helper. Queries the `leads` table for any row with the same email created within the time window. Fails open (returns false) on DB errors to avoid blocking legitimate submissions.
- **Schema Migration** (`supabase/schema.sql`) — Added `name TEXT` (optional submitter name) and `notified_at TIMESTAMPTZ` columns to the `leads` table with migration-safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements.
- **DB Layer** (`lib/supabase/db.ts`) — Updated `insertLead` to accept optional `name` parameter and persist it alongside `email` and `audit_id`.
- **Server Action** (`app/actions/lead.ts`) — Rewrote `captureLeadAction` with: optional `name` field, Zod validation including name max-length, 10-minute duplicate check, `insertLead` with name, non-fatal `sendLeadEmails` call with audit summary fetched from DB.
- **UI — Lead CTA** (`components/results/results-cta.tsx`) — Added optional name input above the email field. Updated copy: "Get your savings report by email" with dynamic savings figure in description. Updated success state: "Check your inbox — report is on its way!" Updated toast messages.

### Decisions

- **`Promise.allSettled` for parallel sends** — Both confirmation and notification emails fire in parallel; a failure in one doesn't block the other.
- **10-minute deduplication window** — Balances UX (accidental double-clicks, browser refresh) against allowing re-submissions after meaningful time has passed.
- **Non-fatal email chain** — Email sending is always wrapped in a try/catch inside the server action. A Resend outage never breaks lead capture.
- **`notified_at` column reserved** — Added to schema now for future use (e.g., tracking when a follow-up was sent), without wiring it in yet.

### Next

- Phase 10: Deployment + production hardening

---

## Day 5 (continued) — Phase 10: Shareable Reports + SEO

**Date:** 2026-05-25

### Done

- **Root Metadata Upgrade** (`app/layout.tsx`) — Added `metadataBase` (reads `NEXT_PUBLIC_APP_URL`), title template (`%s | StackAudit`), full `openGraph` + `twitter` defaults, and `robots: { index: true, follow: true }`.
- **Dynamic Per-Audit Metadata** (`app/results/[id]/page.tsx`) — `generateMetadata` now fetches the real audit from Supabase and produces: personalized `title` ("Save $X/yr on AI tools"), `description` (tool count + recommendation count), `openGraph.images` pointing to the dynamic OG route, `twitter.card: "summary_large_image"`, and `alternates.canonical` URL.
- **Site-Level OG Image** (`app/opengraph-image.tsx`) — Static 1200×630 branded card using Next.js `ImageResponse` (edge runtime). Used on landing, audit, and any page without a specific OG image.
- **Dynamic Audit OG Image** (`app/results/[id]/opengraph-image.tsx`) — Per-audit 1200×630 card. Fetches real savings figures from Supabase and renders: large savings number, "Potential Annual Savings" label, 4-column stats bar (spend, tools, recommendations, savings %). Falls back to a generic branded card if audit not found.
- **Share Button Upgrade** (`components/results/share-button.tsx`) — Replaced stub "Copy link" button with a full dropdown: Copy link (with ?shared=1 appended + ✓ confirmation toast), Share on X/Twitter (pre-filled tweet text + URL), Share on LinkedIn. Keyboard-accessible with backdrop dismiss.
- **`isShared` Pattern** — Results page (`page.tsx`) reads `?shared=1` from searchParams. Passed as `isShared` prop to `ResultsPageClient` and `ResultsCta`.
  - `ResultsPageClient`: hides "Edit Stack" back button for external viewers.
  - `ResultsCta`: swaps the email capture form for a "Audit your own AI stack" CTA with "Run free audit →" button.
- **Architecture docs** — Updated ARCHITECTURE.md flow diagram (Gemini + Resend + OG image), route table (added shared view + OG image route).

### Decisions

- **`?shared=1` over separate route** — Keeps one canonical URL per audit; sharing just appends a query param that switches the UI mode. Simpler than maintaining a `/share/[id]` route.
- **`next/og` ImageResponse** — Built-in edge function, zero external dependencies, works on Vercel for free. Dynamic images generated on-demand and cached by CDN.
- **Fallback OG image** — If audit is not found (expired, private fallback mode), the OG image renders a generic branded card instead of a 404.

### Next

- Phase 11: Deployment to Vercel + domain + final polish
