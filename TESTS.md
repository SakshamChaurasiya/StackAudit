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
