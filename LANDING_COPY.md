# Landing Copy

> Source of truth for marketing copy. Implemented in `data/landing-content.ts` and `components/landing/`.

**Last updated:** 2026-05-22 (Phase 2 — Marketing Landing Page)

---

## Hero

**Eyebrow:** AI Spend Audit for Startups

**Headline:** Stop overpaying for AI tools you barely use

**Subheadline:** StackAudit maps your AI stack, runs a deterministic spend audit, and surfaces real savings — with monthly totals, annual impact, and reasoning your CFO will actually trust.

| CTA | Label | Target |
| --- | ----- | ------ |
| Primary | Start free audit | `/audit` |
| Secondary | See how it works | `#workflow` |

---

## Trust indicators

| Pill | Message |
| ---- | ------- |
| Lock | No credit card |
| Zap | 3-minute audit |
| Shield | Deterministic logic |
| Users | Shareable reports |

**Stats row**

| Value | Label |
| ----- | ----- |
| 9+ | AI tools supported |
| $480 | Avg. annual savings found* |
| 100% | Transparent rules |

*Footnote: Illustrative benchmark for demo purposes.

---

## Features (grid)

1. **Full-stack visibility** — Cursor, Copilot, ChatGPT, Claude, Gemini, APIs in one audit.
2. **Deterministic engine** — Hardcoded rules, not LLM guesses.
3. **Real dollar impact** — Monthly + annual savings per finding.
4. **Plan-level analysis** — Wrong tiers, overlap, retail vs API.
5. **AI summary layer** — Optional founder brief on top of numbers.
6. **Shareable reports** — Public URL for co-founders and finance.

---

## Benefits

### 01 — Built for startup burn

- Seat vs API comparisons
- Overlap detection
- Downgrade paths with plain-English rationale

### 02 — Credible enough to act on

- Monthly + annual savings per finding
- Founder-friendly reasoning
- Export-ready for board updates

---

## Workflow

1. **List your tools & spend** — Plans, seats, use case (~3 min).
2. **Run the deterministic audit** — Redundant subs, wrong tier, API vs seats.
3. **Review savings & share** — Recommendations, AI summary, public report.

---

## FAQ

1. Is this just ChatGPT analyzing my bills? → No, deterministic engine for math.
2. Which tools supported? → Cursor, Copilot, Claude, ChatGPT, APIs, Gemini, Windsurf/v0.
3. How long? → Under 3 minutes intake, instant results.
4. Bank connection? → Manual entry for MVP.
5. Share with team? → Public report URL.
6. Really free? → Yes, email capture for results.

---

## Final CTA

**Headline:** Your AI stack should not be a black box on your P&L

**Subheadline:** Run a free audit in under three minutes. See exactly where you are overpaying — and what to do about it.

**Button:** Start your free audit → `/audit`

**Microcopy:** Free · No credit card · Results in minutes

---

## Screenshot notes

Capture at **1280×800** or **1440×900** for Product Hunt / README:

| File | Section |
| ---- | ------- |
| `docs/screenshots/hero.png` | Hero + audit preview card |
| `docs/screenshots/features.png` | Features grid |
| `docs/screenshots/workflow.png` | Workflow steps |
| `docs/screenshots/cta.png` | Final CTA card |

Run `npm run dev` → http://localhost:3000
