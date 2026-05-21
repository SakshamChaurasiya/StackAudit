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

## Folder structure

```
app/
  (marketing)/     # Landing page
  audit/           # Spend input form
  results/[id]/    # Audit results + public report

components/
  landing/ form/ results/ shared/ ui/

lib/
  audit-engine/    # Deterministic savings logic
  pricing/         # Hardcoded plan data
  ai/              # Anthropic summary
  email/           # Resend lead notifications
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
