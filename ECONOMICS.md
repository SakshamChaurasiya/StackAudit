# StackAudit Unit Economics

This document provides a realistic, financially believable breakdown of StackAudit’s operating margins, variable cost of goods sold (COGS), fixed infrastructure overhead, and customer lifetime value (LTV) projections.

---

## 1. Variable Cost Per Audit (COGS)

StackAudit is architected to run with extreme efficiency, utilizing client-side fallbacks and low-cost API models. The numbers below represent the fully-loaded cost of processing a single audit with AI summary generation and lead emails sent, assuming we are operating above free tiers (Pro infrastructure pricing).

| Cost Driver | Metric | Calculation | Cost Per Audit (USD) |
| :--- | :--- | :--- | :--- |
| **AI Summary** | Gemini 1.5 Flash API | Input: ~1,500 tokens ($0.075/M)<br>Output: ~150 tokens ($0.30/M) | $0.000158 |
| **Email Delivery** | Resend Starter Tier | 2 emails per audit (Confirmation + Admin notification) at $0.0004/email | $0.000800 |
| **Database Write** | Supabase Pro | Data payload: ~5KB. Average transaction cost amortized | $0.000250 |
| **Hosting & Exec** | Vercel Pro | Serverless function runtime: ~200ms of execution | $0.000100 |
| **Total Variable Cost** | **Fully Loaded COGS** | **Sum of all variable costs per transaction** | **$0.001308** |

### Key Takeaway
At **$0.0013 per audit** (less than 1/7th of a cent), StackAudit has virtually 100% gross margins. We can support **10,000 free audits for just $13.08** in direct variable costs, making our viral free acquisition loop highly sustainable.

---

## 2. Fixed Infrastructure Overhead (Monthly Run Rate)

To support production scale, custom domains, and database backups, the platform runs on standard Pro tiers:

- **Supabase Pro Tier:** $25.00/mo (supports up to 8GB database storage, automatic backups, and high connection pools)
- **Vercel Pro Tier:** $20.00/mo (team collaboration, custom domains, and elevated serverless execution limits)
- **Resend Starter Tier:** $20.00/mo (supports up to 50,000 sent emails per month)
- **Domain Maintenance:** $1.00/mo (amortized annual registration cost of `stackaudit.app`)
- **Total Fixed Costs:** **$66.00/month**

---

## 3. Customer Acquisition Cost (CAC) & Lifetime Value (LTV)

### Monetization Model: StackAudit Pro
- **Pricing:** $29.00/month per organization.
- **Service:** Automated continuous monitoring via Google Workspace SSO and accounting dashboard integrations.

### LTV Projection
- **Gross Margin:** 99.9%
- **Monthly Churn Rate:** 8.0% (conservative estimate for early-stage B2B utility SaaS)
- **Average Customer Lifetime:** $1 / 0.08 = 12.5 \text{ months}$
- **Gross Lifetime Value:** $29.00 \times 12.5 \times 99.9\% = \mathbf{\$362.14}$

### CAC Targets
- **Organic Growth (Viral sharing, PH launch, SEO):** Blended CAC target of **$10.00**.
- **Paid Growth (Google Search ads on "SaaS optimization"):** Paid CAC target of **$60.00**.
- **Blended CAC Target:** **$25.00**
- **LTV-to-CAC Ratio:** $\mathbf{14.4x}$ (highly attractive VC-grade metric; any ratio > 3x is healthy)

---

## 4. Break-Even Analysis

To cover the fixed infrastructure overhead of **$66.00/month**:

- At **$29.00/mo per paid customer**, we need exactly **3 active paid subscribers** to break even.
- Assuming a conservative **5.0% conversion rate** from free audit users to paid monitoring subscribers:
  - We require **60 completed audits** to acquire 3 paid customers.
  - Variable COGS for 60 audits: $60 \times \$0.0013 = \$0.078$ (negligible).
- **The Break-Even Threshold:** **60 audits run on the platform.**
