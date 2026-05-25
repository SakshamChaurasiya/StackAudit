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

## Deployment

- **Vercel** — Next.js native; env vars from `.env.example` categories.
- **Supabase** — Postgres + RLS for audits/leads.
- No edge-only requirement for audit engine (runs Node/server).

## Security notes

- Service role key server-only; anon key for client if needed.
- Public reports: UUID ids, no PII in URL; optional expiring links later.
- Rate-limit summary generation in production.

## Testing strategy

See [TESTS.md](./TESTS.md). Engine unit tests are highest priority; UI tests for form and results critical paths.
