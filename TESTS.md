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

## CI (future)

- Run `npm test` + `npm run lint` + `npm run build` on PR.
