# Reflections & Engineering Post-Mortem

This document summarizes the core technical, product, and entrepreneurial reflections during the construction of StackAudit.

---

## What Went Well

### 1. Hybrid Isomorphic Execution (Client-Server Bridge)
We designed the system so that the **exact same deterministic audit logic** runs both on the server (via Next.js Server Actions) and in the client (via local TypeScript libraries falling back to `sessionStorage` and `localStorage`). 
- **Benefits:** If the Supabase database is down, or if the Gemini AI API times out, the app gracefully falls back to client-side mode. The user still gets their audit results immediately without seeing a raw 500 error.
- **Developer Experience:** Enables immediate out-of-the-box local development (`npm run dev`) without needing any Supabase or API secrets configured.

### 2. Strict Determinism at the Core
We resisted the urge to feed the raw user tools list into an LLM to "estimate savings." Instead, we constructed a **fully typed, rule-based engine** in `lib/audit-engine/` that calculates pricing adjustments down to the cent based on verified vendor rules.
- **Benefits:** The recommendations are 100% explainable, predictable, and testable. AI is used solely at the end to synthesize a human-friendly narrative summary. If the AI service fails, we fall back to a structured template.

### 3. Highly Normalized Pricing Layer
Pricing and seat bounds are isolated in `lib/pricing/data/tools.ts`. Changes in pricing catalog rules are automatically caught by unit validation tests in `tests/pricing/validate.test.ts`, preventing human typos from breaking audit logic.

---

## What Was Harder Than Expected

### 1. Multi-Dimensional Recommendation Deduplication
When multiple recommendations apply to a single stack, they can conflict. For example, if a user has both **Cursor Pro** and **GitHub Copilot**, the engine might recommend:
- Downgrading Cursor Pro to Cursor Free (if they barely use it).
- Removing GitHub Copilot because it overlaps with Cursor's built-in tab completion.
- Switching Cursor Pro to Windsurf Pro (if they are a small team of ≤5).
If the engine recommended all three, it would double-count savings or propose conflicting actions. Building the precedence solver in `lib/audit-engine/engine.ts` to cleanly prune and deduplicate findings without violating TypeScript immutability took several iterations.

### 2. Next.js Server Actions Timeout & Error Handling
Next.js serverless functions on platforms like Vercel have hard timeouts (e.g., 30 seconds for hobby/pro plans). If an external API call (like Gemini) hangs, the user is left with a blank spinning loader. We had to implement a custom `withTimeout` wrapper in `app/actions/audit.ts` that races the database + AI calls against a 25-second limit. On timeout, it returns `{ fallback: true }`, giving the frontend a clean recovery path.

---

## Technical Tradeoffs

### 1. In-Memory Sliding Window Rate Limiter
- **Tradeoff:** The rate limiter (`lib/security/rate-limit.ts`) uses an in-memory `Map` with a probabilistic garbage collector.
- **Pros:** Zero configuration, zero external network latency, zero infrastructure cost.
- **Cons:** In serverless environments, each instance maintains its own memory space. This means a user could bypass limits by hitting different instances.
- **Verdict:** Correct for MVP launch. Before hitting Product Hunt, we will swap the internal `store` Map with an Upstash Redis connection.

### 2. Curated Static Pricing vs. Real-Time Scraping APIs
- **Tradeoff:** All tool pricing configurations are statically maintained in `lib/pricing/data/tools.ts`.
- **Pros:** Sub-millisecond lookup times, zero run-time network failures, and deterministic test assertions.
- **Cons:** Pricing changes by SaaS providers require a code deployment.
- **Verdict:** Real-time SaaS pricing APIs are notoriously fragile and slow. A statically verified catalog is standard practice in FinOps tools, with pricing audits done weekly.

---

## Product Tradeoffs

### 1. Manual Form Intake vs. Automated Invoice Ingestion
- **Tradeoff:** Users must manually input their tools, plans, seats, and monthly spend.
- **Pros:** No privacy/compliance friction (GDPR, SOC2), zero security risks (no bank or email connection required), and zero ingestion failures.
- **Cons:** The user must open their billing tab and copy-paste numbers (takes ~3 minutes).
- **Verdict:** Startup founders are highly protective of their billing dashboards. Offering a manual, private-by-design tool lowers the barrier to entry significantly. We can add automated PDF invoice uploads in v2.

### 2. Public UUID Reports vs. Authenticated Portals
- **Tradeoff:** Reports are accessible via unique UUID links without requiring a login.
- **Pros:** Frictionless viral loop. A founder can instantly paste their audit link in Slack to their co-founder or investor.
- **Cons:** If someone guesses or intercepts the UUID, they can see the stack details (though no sensitive personally identifiable information like card numbers is stored).
- **Verdict:** Essential for viral growth. The UUID contains 128 bits of entropy (impossible to guess), and we added a `?shared=1` parameter to strip editing capabilities for public viewers.

---

## If We Had Another Week...

1. **Slack Alert Integration:** A Slack app that auto-alerts the engineering channel when a developer subscribes to an overlapping tool (e.g. "We noticed you just activated Claude Pro, but the company already has a ChatGPT Team workspace").
2. **Team Account Consolidated Auditing:** OAuth integrations with Google Workspace (Google OAuth) to scan single-sign-on (SSO) logs and automatically flag shadow-IT spend.
3. **Advanced API Arbitrage:** Deep analysis of API cost models vs. subscription models based on actual token usage inputs, helping teams determine exactly when to migrate from seat-based subscriptions to token usage limits.
