# StackAudit Marketing Copy Registry

This document serves as the single source of truth for all customer-facing copywriting across the landing page (`/`), audit intake form (`/audit`), and emails. It is optimized for conversion, clarity, and founder-level relevance.

---

## 1. Hero Section

- **Eyebrow:** AI SPEND AUDIT FOR ENGINEERING TEAMS
- **Headline:** Stop wasting cash on duplicate AI seats
- **Subheadline:** Your developers are subscribing to Cursor Pro, Windsurf Pro, Claude Pro, and ChatGPT Team all at once. StackAudit runs a deterministic financial audit on your AI stack to identify redundant licenses, over-provisioned plans, and cheaper API alternatives in 3 minutes.
- **CTAs:**
  - **Primary CTA:** Run Free Audit → (links to `/audit`)
  - **Secondary CTA:** How It Works (anchors to `#workflow`)
- **Trust Banner / Trust Badges:**
  - **Privacy First:** No corporate bank credentials or database access required.
  - **Speed:** Complete the manual intake in under 3 minutes.
  - **Deterministic:** Calculations based on verified vendor pricing catalogs, not AI estimates.

---

## 2. Trust Indicators & Social Proof

- **Stats Row:**
  - **9+ Popular AI Tools** (Full catalog integration including Cursor, Claude, ChatGPT, GitHub Copilot, Windsurf, v0, OpenAI APIs, and Gemini).
  - **$640 Avg. Annual Savings Found** (Based on anonymized audits of teams with 5–25 developers).
  - **100% Rule Transparency** (Every recommendation includes a clear, mathematical rationale your CFO can instantly verify).

---

## 3. Core Features Grid

1. **Overlapping IDE Redundancy Check**
   *Copy:* Detect when developers are paying for both Cursor Pro and GitHub Copilot seats simultaneously, eliminating duplicate autocomplete billing.
2. **Minimum Seat Floor Audit**
   *Copy:* Flag ChatGPT Team and Claude Team workspaces that fall below vendor seat minimums (e.g. ChatGPT Team's 2-seat minimum), preventing stealth price inflation.
3. **API vs. Subscription Arbitrage**
   *Copy:* Calculate exactly when it is cheaper to migrate developer seats to pay-per-token API access based on actual volume requirements.
4. **Developer Tier Right-Sizing**
   *Copy:* Identify team members on bloated Enterprise or Business plans who can be safely downgraded to standard Pro accounts without losing core features.
5. **Cheaper IDE Alternatives**
   *Copy:* Surface savings by switching smaller teams (≤5 seats) from Cursor Pro ($20/mo) to Windsurf Pro ($15/mo) while maintaining equivalent capabilities.
6. **No-PII Shareable Dashboards**
   *Copy:* Generate secure, anonymized public reports to share with co-founders, investors, or finance directors.

---

## 4. Intake Form Context & Form Labels (`/audit`)

- **Intake Title:** Run Your AI Spend Audit
- **Intake Subtitle:** Enter your team's current AI tool allocations. We do not ask for invoices or bank connections.
- **Team Size Field:**
  - **Label:** Total Team Size
  - **Placeholder:** e.g. 15
  - **Helper Text:** Total headcount of your company (used to calculate seat occupancy floors).
- **Tool Selection Row:**
  - **Tool Dropdown:** Choose AI Tool
  - **Plan Dropdown:** Plan Tier
  - **Spend Input:** Monthly Spend (USD)
  - **Seats Input:** Allocated Seats (Optional; required for IDEs and Team workspaces)
  - **Use Case Dropdown:** Core Use Case (Engineering, Product, Marketing, Support, etc.)

---

## 5. Value Propositions & Benefits

### Benefit 01: CFO-Ready Calculations
Most FinOps tools output "estimated savings ranges." StackAudit outputs precise dollar amounts down to the cent, cross-referenced with official SaaS vendor terms. You get an exportable summary that can be directly copy-pasted into your board deck or cost-cutting spreadsheet.

### Benefit 02: 100% Privacy-Preserved
We do not ask you to connect your bank account (via Plaid) or sync your corporate Google Workspace admin keys. You retain full control over what data is entered.

---

## 6. Comprehensive FAQ

**Q: Is this tool just throwing my data at ChatGPT and asking it to write a summary?**
*A:* No. The pricing calculations and recommendation rules are entirely deterministic. They are written in TypeScript using hardcoded pricing schemas and run on our local server. AI is only used to synthesize the results into a readable 3-sentence narrative at the end of the report.

**Q: Which AI tools are currently supported in the audit?**
*A:* We support Cursor Pro/Business, GitHub Copilot Individual/Business, ChatGPT Plus/Team/Enterprise, Claude Pro/Team, Gemini Advanced/Business, Windsurf Pro/Team, v0, OpenAI API usage, and Anthropic API usage.

**Q: Why do you ask for email capture?**
*A:* We use your email to send a permanent link to your audit dashboard so you can access it later, and to notify you when pricing models in our catalog change for the tools in your stack. We never sell your data.

**Q: Can I share this audit with my co-founders or investors?**
*A:* Yes. Clicking "Share" generates a public, read-only URL. When visited by others, editing capabilities are disabled, and it displays a clean, readable dashboard summarizing your savings.
