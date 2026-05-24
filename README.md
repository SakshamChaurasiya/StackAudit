# StackAudit

**AI Spend Audit** — a production SaaS web app that helps startups analyze and optimize AI tool spending.

Built for the Credex hiring assignment. Deterministic audit logic, AI only for personalized summaries, shareable public reports.

## Tech stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **UI:** Tailwind CSS, shadcn/ui, React Hook Form, Zod
- **Data:** Supabase
- **AI:** Anthropic API (summary only)
- **Email:** Resend
- **Testing:** Vitest, React Testing Library
- **Deploy:** Vercel

## Getting started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run dev`      | Dev server (Turbopack)   |
| `npm run build`    | Production build         |
| `npm run lint`     | ESLint                   |
| `npm run format`   | Prettier write           |
| `npm test`         | Vitest (single run)      |
| `npm run test:watch` | Vitest watch           |

## Setup progress

| Phase | Status | Scope |
| ----- | ------ | ----- |
| 0 | Done | Scaffold, tooling, docs |
| 1 | Done | Design system, layout, UI primitives |
| 2 | Done | Marketing landing page |
| 3 | Done | Audit form + validation + localStorage |
| 4 | Done | Centralized pricing data layer |
| 5 | Done | Deterministic audit engine |
| 6 | Done | Results UX (savings hero, cards, breakdowns) |

## Features (shipped)

- **Landing** — Hero, features, benefits, workflow, FAQ, trust indicators
- **Audit form** (`/audit`) — Dynamic tool rows (add/remove, max 15), tool & plan selectors from catalog, monthly spend, seats for seat-based tools, team size, use case; React Hook Form + Zod; debounced `localStorage` draft (`stackaudit-audit-draft`); duplicate-tool prevention
- **Audit engine core** (`lib/audit-engine`) — Deterministic, explainable recommendation logic across 6 rule modules: plan overspends, downgrades, redundant tool overlaps (e.g. Cursor & Copilot), API seat arbitrage, alternative tool options, and seat-floor waste. Deterministic priority scoring (P1/P2/P3).
- **Results Experience** (`/results/[id]`) — Polished, screenshot-worthy results UI including:
  - **Savings Hero** — Huge annual savings display with a fallback for already optimized stacks.
  - **Financial Summary Bar** — Compact overview of monthly spend, list price, and billing gap.
  - **Actionable Recommendations** — Grouped by priority (P1/P2/P3) and detailed with clear, deterministic reasoning and savings.
  - **Tool Breakdown** — Detailed per-tool table showing seats, your spend vs catalog list price, and delta status badges.
  - **Conditional CTAs** — Shareable results stub and email capture stub (uses `lib/toast` fallback for subsequent phases).
  - **Session-storage Bridge** — Client-side serialization and retrieval patterns, fully preparing the application for database integration in Phase 7.

### Audit form quick reference

| Field | Scope | Notes |
| ----- | ----- | ----- |
| Team size | Form | Whole company headcount |
| Tool | Per row | 9 supported tools; duplicates blocked |
| Plan | Per row | Catalog-driven per tool |
| Monthly spend | Per row | USD; required &gt; 0 on submit |
| Seats | Per row | Required for Cursor, Copilot, Windsurf |
| Use case | Per row | Engineering, product, design, etc. |

## Screenshots

Landing page sections are built for Product Hunt–quality captures. After running the dev server, save PNGs to `docs/screenshots/` (see [docs/screenshots/README.md](./docs/screenshots/README.md)).

| Preview | File | Section |
| ------- | ---- | ------- |
| ![Hero Preview](./docs/screenshots/hero.png) | `docs/screenshots/hero.png` | Hero + audit preview |
| ![Features Preview](./docs/screenshots/features.png) | `docs/screenshots/features.png` | Features grid |
| ![Workflow Preview](./docs/screenshots/workflow.png) | `docs/screenshots/workflow.png` | Workflow steps |
| ![CTA Preview](./docs/screenshots/cta.png) | `docs/screenshots/cta.png` | Final CTA |

```bash
npm run dev
# → http://localhost:3000
```

## Design system (Phase 1)

- **Layout:** `SiteLayout`, `Navbar`, `Footer`, `Container`, `Section`
- **Typography:** `Display`, `Title`, `Lead`, `Eyebrow`, `Text`, `Caption`
- **UI:** Button (incl. `brand` variant), Card, Input, Textarea, Label, Badge, Separator
- **Forms:** `FormField` wrapper (label, hint, error, a11y)
- **Toast:** Sonner via `lib/toast` + `<Toaster />` in root layout
- **Tokens:** `lib/design/tokens.ts` + CSS variables in `app/globals.css`

## Folder structure

```
app/
  (marketing)/     # Landing page
  audit/           # Spend input form
  results/[id]/    # Audit results + public report

components/
  shared/          # Layout, typography, containers, form-field
  landing/         # Marketing sections (hero, features, FAQ, …)
  form/ results/ ui/

data/
  landing-content.ts  # Marketing copy (single source)

lib/
  design/          # Spacing & layout tokens
  audit-form/      # Zod schema, defaults, localStorage
  audit-engine/    # Deterministic savings logic
  pricing/         # Normalized catalog, sources, models, validation
  ai/              # Anthropic summary
  email/           # Resend lead notifications
  toast.ts         # Toast helper (Sonner)
  utils/

types/             # Shared TypeScript types
data/              # Static pricing / reference data
tests/             # Vitest + RTL
```

## Documentation

| File                 | Purpose                          |
| -------------------- | -------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & phases   |
| [DEVLOG.md](./DEVLOG.md)             | Daily build log          |
| [PRICING_DATA.md](./PRICING_DATA.md) | Pricing sources          |
| [TESTS.md](./TESTS.md)               | Testing strategy         |

See repo root for additional product docs (`GTM.md`, `METRICS.md`, etc.).

## Environment variables

Copy `.env.example` to `.env.local`. Keys are introduced per phase — see `ARCHITECTURE.md`.

## License

Private — Credex assignment project.
