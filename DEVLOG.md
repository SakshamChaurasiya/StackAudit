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
