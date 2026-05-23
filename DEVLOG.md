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

- Phase 5: Deterministic audit engine (consumes `PRICING_CATALOG` + form input)
