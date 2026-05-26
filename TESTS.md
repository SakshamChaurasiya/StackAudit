# Testing Strategy

## Stack

- **Vitest** — unit and integration tests
- **React Testing Library** — component behavior
- **jsdom** — DOM environment

## Commands

```bash
npm test              # single run
npm run test:watch    # watch mode
```

## Current coverage

### Pricing Layer
- `tests/pricing/validate.test.ts` — catalog integrity (plan pricing matches, IDs exist)
- `tests/pricing/models.test.ts` — cost estimation, seat rules, formatting

### Audit Form
- `tests/audit-form/schema.test.ts` — Zod rules (seats, spend, min tools, duplicates)
- `tests/audit-form/storage.test.ts` — localStorage draft load, save, clear round-trip

### UI Components
- `tests/components/container.test.tsx` — Container/Section layout classes
- `tests/components/typography.test.tsx` — Display, Eyebrow, Lead rendering
- `tests/landing/content.test.ts` — landing copy structure integrity

### Audit Engine Core
- `tests/audit-engine/calculator.test.ts` — Pure financial math (aggregate spend, savings percentages, annual multiplier)
- `tests/audit-engine/overspend.test.ts` — reported > list * 1.15 logic trigger and savings output
- `tests/audit-engine/downgrade.test.ts` — plan downgrading (business -> pro) rules for Cursor, ChatGPT, etc.
- `tests/audit-engine/redundant.test.ts` — overlapping paid tools (Cursor + Copilot, Claude + ChatGPT, LLM APIs)
- `tests/audit-engine/api-switch.test.ts` — Pro subscriptions vs. developer token usage arbitrage
- `tests/audit-engine/engine.test.ts` — End-to-end scenarios covering clean stacks, IDE overlaps, seat floors, and sorting/deduplication logic.

### Security (Phase 11)
- `tests/security/rate-limit.test.ts` — Rate limiter: allowed under limit, blocked over limit, retryAfterMs value, IP isolation, LEAD_LIMIT preset, fresh-key reset

### AI Fallback (Phase 11)
- `tests/audit-engine/fallback.test.ts` — `generateFallbackSummary`: non-empty output, includes tool count, includes spend, includes savings figures, includes top recommendation, optimised path (no savings), team size mention

### Priority & Sorting (Phase 12)
- `tests/audit-engine/priority.test.ts` — `scoreRecommendationPriority` (P1/P2/P3 thresholds, elevated types: redundant, unused-tier), `sortRecommendations` (cross-priority sort, within-priority by saving desc, immutability), `applyPriorities` (correct scoring, immutability)

### Alternative & Unused-Tier Rules (Phase 12)
- `tests/audit-engine/alternative.test.ts` — Alternative rule: fires Cursor Pro→Windsurf for ≤5 seats, fires at threshold (5 seats), blocked above threshold (6 seats), blocked when Windsurf already in stack, blocked for non-Pro Cursor plan. Unused-tier rule: fires ChatGPT Team 1 seat (P1), skips at 2 seats, fires Claude Team 3 seats, skips at 5 seats

### Engine Edge Cases (Phase 12)
- `tests/audit-engine/edge-cases.test.ts` — Single-tool stack, no duplicate rec IDs in complex stack, recommendations sorted P1 first, summary totals ≤ raw rec totals, zero savingsPercent when no savings, max tool count (9 tools) no crash, scoredAt is valid ISO string

## Priority matrix

| Area              | Type        | Priority |
| ----------------- | ----------- | -------- |
| `lib/audit-engine`| Unit        | P0       |
| `lib/pricing`     | Unit        | P0       |
| Audit form        | Component   | P1       |
| Results page      | Component   | P1       |
| API routes        | Integration | P2       |
| AI summary        | Mocked unit | P2       |

## Conventions

- Tests live in `tests/` mirroring `lib/` structure (e.g. `tests/audit-engine/`).
- Prefer testing **outputs and behavior**, not implementation details.
- Engine tests use fixture stacks (small teams, redundant ChatGPT + Claude, API-heavy usage).

## Coverage goals

- Audit engine: every recommendation rule has at least one positive and negative case.
- No coverage target on UI polish components.

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Triggers: push and pull request to `main`.

Steps:
1. `npm ci` — clean install
2. `npm run lint` — ESLint check
3. `npm test` — Vitest unit tests
4. `npm run build` — Next.js production build

Env vars stubbed in CI: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.
