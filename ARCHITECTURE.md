# Architecture

## Overview

StackAudit is a Next.js 15 App Router application. The **audit engine** is the core product: deterministic, hardcoded financial logic. **AI** is used only for ~100-word personalized summaries. **Supabase** persists audits and leads; **Resend** sends notifications.

```
User → Landing → Audit Form → Audit Engine → Results Page
                                    ↓
                              Supabase (audit + lead)
                                    ↓
                       Gemini (summary) + Resend (email)
                                    ↓
                         Public Shareable URL (OG image)
```

## Principles

1. **Deterministic audits** — savings and recommendations never come from LLM output.
2. **Modular phases** — each feature ships in isolation; no big-bang generation.
3. **Thin routes, fat libs** — `app/` routes compose; logic lives in `lib/`.
4. **Typed boundaries** — Zod at API/form edges; shared types in `types/`.

## Route groups

| Route              | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `/(marketing)`     | Landing, hero, CTA to `/audit`               |
| `/audit`           | Dynamic spend input form (RHF + Zod)         |
| `/results/[id]`    | Results, lead capture, shareable report      |
| `/results/[id]?shared=1` | Public read-only view (hides edit CTA) |
| `/results/[id]/opengraph-image` | Dynamic 1200×630 OG image per audit |

## Library modules

### `lib/audit-engine/`

Pure functions taking the stack inputs and returning deterministic, explainable recommendations along with monthly/annual savings calculations.

| Module | Role |
| ------ | ---- |
| `types.ts` | Shared engine types (`AuditInput`, `AuditResult`, `Recommendation`, `AuditSummary`) |
| `calculator.ts` | Financial math utilities (pure calculations, savings percent, annual multipliers) |
| `priority.ts` | Recommendation priority scoring (P1/P2/P3) and sorting |
| `engine.ts` | Main orchestrator running rules, deduplicating, and calculating the summary |
| `rules/` | Specific recommendation rule modules (overspend, downgrade, redundant, api-switch, alternative, unused-tier) |
| `index.ts` | Public API re-exporting core functions and types |

#### Data Flow:
```
AuditInput (form values + teamSize)
   ↓
runAudit()
   ├─ Enrich inputs using PRICING_CATALOG
   ├─ Run rule modules:
   │    ├─ overspend: reported > list * 1.15
   │    ├─ downgrade: business -> pro for small teams
   │    ├─ redundant: overlapping paid tools (e.g. Cursor + Copilot)
   │    ├─ api-switch: chat seat -> API usage (engineering usecase)
   │    ├─ alternative: Windsurf vs Cursor Pro
   │    └─ unused-tier: seat floors (e.g. Claude Team min 5 seats)
   ├─ Deduplicate conflicting suggestions (keeping highest saving)
   ├─ Score priorities (P1 / P2 / P3)
   └─ Compute summary (total spend, estimated list, savings)
   ↓
AuditResult (summary, recommendations, scoredAt)
```

### `lib/pricing/`

Centralized pricing layer — normalized tools/plans, list prices, vendor sources, validation.

| Module | Role |
| ------ | ---- |
| `types.ts` | `NormalizedTool`, `NormalizedPlan`, `PriceSource` |
| `data/tools.ts` | Editable list prices (single source) |
| `sources.ts` | Vendor URL + `checkedAt` registry |
| `models.ts` | Cost estimation, seat rules, formatting |
| `validate.ts` | Catalog integrity for CI/tests |
| `catalog.ts` | Form-facing re-exports (backward compatible) |
| `index.ts` | `PRICING_CATALOG` singleton |

Documented in `PRICING_DATA.md`. Audit engine (Phase 5) consumes `estimateMonthlyListCost` and overlap metadata.

### `lib/audit-form/`

| File | Role |
| ---- | ---- |
| `schema.ts` | `auditFormSchema` (submit) + `auditFormDraftSchema` (hydrate), defaults |
| `constants.ts` | Use cases, storage key, row limits |
| `storage.ts` | `localStorage` draft load/save/clear (draft schema on load) |

Types exported via `types/audit-form.ts`.

### `lib/ai/`

Anthropic client for summary generation only. Static fallback if API fails.

### `lib/email/`

Resend integration for lead capture notifications.

### `lib/utils/`

`cn()` and small shared helpers.

### `lib/design/`

Spacing and container width tokens consumed by shared layout components.

### `lib/toast.ts`

Thin wrapper over Sonner for consistent success/error/info/promise toasts.

## UI architecture (Phase 1)

Layered design system — routes compose shared layout; pages use typography + containers; forms use primitives.

```
app/layout.tsx          → fonts, globals, <Toaster />
app/*/layout.tsx        → <SiteLayout> (navbar + main + footer)

components/shared/      → layout shell, typography, containers, FormField
components/ui/          → shadcn primitives (Button, Card, Input, …)
lib/design/tokens.ts    → section spacing, max-width constants
app/globals.css         → CSS variables (theme), base typography rules
```

| Component | Role |
| --------- | ---- |
| `SiteLayout` | Sticky navbar, skip link, flex column min-height |
| `Container` / `Section` | Responsive horizontal padding + max-width + vertical rhythm |
| `Display` / `Lead` / … | Semantic typography scale (Tailwind `fontSize` tokens) |
| `FormField` | Accessible label + hint + error wiring for RHF fields (Phase 2) |
| `Button` variants | `default`, `brand`, `outline`, `secondary`, `ghost`, `link`, `destructive` |

**Theme:** HSL CSS variables in `:root` — slate foreground, brand blue accent (`--brand`), success green for savings UI later. Dark mode variables defined; toggle deferred.

**Toast:** Sonner `<Toaster />` in root layout; call `toast.success()` from `lib/toast` in client components or server actions (Phase 5+).

**Accessibility:** Skip link, `aria-*` on `FormField`, focus rings on interactive elements, semantic headings via typography components.

## Audit form flow (Phase 3)

```
/audit (AuditForm client component)
  ├─ useForm + zodResolver(auditFormSchema)
  ├─ useFieldArray("tools") → ToolRow × n
  ├─ watch → debounced saveAuditDraft → localStorage
  ├─ mount → loadAuditDraft → reset(form)
  └─ submit → auditFormSchema → save → toast (engine redirect Phase 4)
```

**Per tool row:** `tool` → `plan` (catalog-driven) → `monthlySpend` → `seats` (if seat-based) → `useCase`.

**Global:** `teamSize` (company context for engine rules).

**Validation layers:**

| Layer | Schema | When |
| ----- | ------ | ---- |
| Hydrate | `auditFormDraftSchema` | `loadAuditDraft()` — allows $0 spend while editing |
| Submit | `auditFormSchema` | Form submit — positive spend, no duplicate tools, valid plans |

**Components:** `components/form/audit-form.tsx`, `tool-row.tsx`, `form-select.tsx`, `form-number-input.tsx`.

## Results flow & Session-storage Bridge (Phase 6)

During Phase 6, data was bridged client-side using `sessionStorage` under `stackaudit-result-{uuid}` before routing the user to `/results/{uuid}`.

## Database Flow & Supabase Persistence (Phase 7)

In Phase 7, the application utilizes Server Actions and a Supabase database configuration to persist audit results and captured lead emails.

### Data Flow Diagram:
```
User submits AuditForm
    ↓
Server Action: runAndSaveAuditAction(input)
    ├─ Valides schema on the server
    ├─ If Supabase unconfigured: Returns fallback flag
    ├─ Runs runAudit(input)
    ├─ Inserts audit input & results to Supabase audits table
    └─ Returns UUID id
    ↓
Redirect to /results/[id]
    ├─ Server Component (page.tsx) queries selectAudit(id) from Supabase
    ├─ If record exists: Server pre-renders results and passes initialResult to ResultsPageClient
    └─ If null (Fallback Mode): ResultsPageClient hydrates from sessionStorage
```

### Table Layouts & Row Level Security (RLS)

1. **`audits` table**: Holds user inputs, calculated totals, and recommendations list.
   - Anyone (anonymous submission) is granted insert permissions.
   - Anyone is granted select permissions to read public results pages.
2. **`leads` table**: Holds captured email addresses linked to specific audit IDs.
   - Anyone is granted insert permissions to register their email.
   - Read/select access is restricted entirely to the service role (admin-only) to secure user emails.

## Supported tools

Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf or v0.

## Build phases

| Phase | Scope                                      |
| ----- | ------------------------------------------ |
| 0     | Scaffold, tooling, docs                    |
| 1     | Design system + shared layout              |
| 2     | Marketing landing page                     |
| 3     | Audit form + validation + localStorage     |
| 4     | Pricing data layer                         |
| 5     | Audit engine core                          |
| 6     | Results Experience UX                      |
| 7     | Backend & Database persistence (Supabase)  |
| 8     | AI summary + fallback                      |
| 9     | Lead notifications + Resend                |
| 10    | Public shareable reports + deploy          |
| 11    | Security, Validation & Edge Cases          |
| 12    | Testing + CI (GitHub Actions workflow)     |
| 13    | Documentation & Entrepreneurial Files      |

## Deployment

- **Vercel** — Production build targeted. Next.js serverless functions process Server Actions.
- **Supabase** — Relational storage with RLS policies mapping to anonymous/authenticated roles.
- **Resend** — SMTP-based transactional email delivery.

## Security & Rate Limiting Architecture

To protect serverless functions from abuse and unnecessary API expenses:
- **Sliding-Window Rate Limiter** (`lib/security/rate-limit.ts`): Tracks request counts against a sliding millisecond window in a Node-level `Map` store. 
- **Probabilistic Cleanup:** Every check has a 5% chance of running a cleanup sweep to delete keys whose timestamps are older than $2 \times \text{windowMs}$, preventing memory leaks.
- **Server Action Timeouts:** Next.js actions are protected by a race-condition wrapper (`withTimeout` in `app/actions/audit.ts`) that enforces a **25-second ceiling**. If execution exceeds 25s, it throws a timeout error, prompting the frontend to transition to offline client-side fallback execution rather than hitting Vercel's hard 30s crash.
- **Input Sanitization:** Form field validation schemas trim accidental whitespace and enforce strict character ceilings to prevent database buffer injection.

## Resilience & Fallback Architecture

StackAudit maintains continuous operation via a layered client-server redundancy model:

```
[Form Submission]
       ↓
Server Action (rate-limited, 25s timeout)
       ├─► [Success]  Saved to Supabase ──► Server-rendered /results/[id]
       └─► [Failure]  3 consecutive retries fail OR Supabase unconfigured
             │
             └─► [Fallback Mode] Hydrates client-side engine ──► sessionStorage ──► Client-rendered /results/[id] (Development Mode)
```

1. **3-Strike Server Retry:** The audit form handles server errors gracefully. It displays an inline retry alert and allows the user to re-submit up to 3 times.
2. **Isomorphic Engine Fallback:** After 3 consecutive server failures, the client automatically executes the audit engine inside the browser using standard JavaScript, saving the draft in `sessionStorage` and transitioning seamlessly to the results view.
3. **React Error Boundary:** Wrapping the main results dashboard prevents uncaught JavaScript runtime errors in client components from crashing the entire app shell, rendering a clean, stylized recovery card.

## Testing & CI Pipeline

The testing architecture is built for strict verification of deterministic code path branches:
- **Continuous Integration (GitHub Actions):** `.github/workflows/ci.yml` runs automatically on pushes and PRs to `main`. It runs `npm ci` (clean install), `npm run lint` (ESLint syntax check), `npm test` (Vitest test suite), and `npm run build` (production compiler validation) with mock Supabase keys injected.
- **Deterministic Mock Timers:** Time-sensitive test assertions (e.g. rate limiter reset windows) utilize Vitest fake timers (`vi.useFakeTimers`) to guarantee test suite stability across varying hardware latencies.
