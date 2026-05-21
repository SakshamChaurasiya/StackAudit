# Architecture

## Overview

StackAudit is a Next.js 15 App Router application. The **audit engine** is the core product: deterministic, hardcoded financial logic. **AI** is used only for ~100-word personalized summaries. **Supabase** persists audits and leads; **Resend** sends notifications.

```
User → Landing → Audit Form → Audit Engine → Results Page
                                    ↓
                              Supabase (audit + lead)
                                    ↓
                         Anthropic (summary) + Public URL
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
| `/audit`           | Multi-step spend input (RHF + Zod)           |
| `/results/[id]`    | Results, lead capture, shareable report      |

## Library modules

### `lib/audit-engine/`

Pure functions: input stack → recommendations + monthly/annual savings. Rules cover team plan overspend, redundant tools, API vs seat pricing, retail vs credits, cheaper alternatives.

### `lib/pricing/`

Hardcoded plan tiers and prices per supported tool. Single source for engine + form options. Documented in `PRICING_DATA.md`.

### `lib/ai/`

Anthropic client for summary generation only. Static fallback if API fails.

### `lib/email/`

Resend integration for lead capture notifications.

### `lib/utils/`

`cn()` and small shared helpers.

## Data flow (target state)

1. User submits audit form → validate with Zod.
2. Server action or API route runs `auditEngine(stack)`.
3. Persist `{ id, input, results, createdAt }` to Supabase.
4. Optionally generate AI summary (async or on-demand).
5. Redirect to `/results/[id]`.
6. Lead form on results → Supabase + Resend.
7. Public report: same `[id]` route, read-only when shared.

## Supported tools

Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf or v0.

## Build phases

| Phase | Scope                                      |
| ----- | ------------------------------------------ |
| 0     | Scaffold, tooling, docs (this repo state)  |
| 1     | Landing page polish                        |
| 2     | Audit form + validation                    |
| 3     | Audit engine + pricing data                |
| 4     | Results UI + savings display               |
| 5     | Supabase persistence                       |
| 6     | AI summary + fallback                      |
| 7     | Lead capture + Resend                      |
| 8     | Public shareable reports                   |
| 9     | Tests, deploy, hardening                   |

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
