# StackAudit Analytics & Metrics Playbook

This document defines the key performance indicators (KPIs), event tracking schemas, and analytical cohorts used to measure StackAudit's growth, viral loops, and operational stability.

---

## 1. The North Star Metric

### **Weekly Lead-Qualified Audits (WLQA)**
*Defined as: The number of completed audits that successfully capture a verified business email address within a 7-day window.*

**Why this matters:**
- It validates the **utility value** (the user went through the effort of entering their tools list).
- It validates the **commercial intent** (the user is willing to trade their corporate email address to see or unlock the results/shares).
- It serves as the primary pipeline driver for both lead-generation affiliate deals and Pro SaaS conversions.

---

## 2. Acquisition & Conversion Funnel

We track the user journey linearly to isolate friction points:

```
[Visitor] -> landing_view (100%)
                ↓  (CTAClick)
[Form Intake] -> audit_started (~65%)
                ↓  (Form Submit)
[Processed] -> audit_submitted (~45%)
                ↓  (Hydrate page)
[Viewer]    -> results_viewed (~45%)
                ↓  (Capture Email Action)
[Lead]      -> lead_captured (~15% of total, target: 33% of viewers)
                ↓  (Click Share Options)
[Promoter]  -> report_shared (~3% of total, target: 10% of viewers)
```

### Conversion Event Registry

| Event Name | Trigger Context | Target KPI |
| :--- | :--- | :--- |
| `landing_view` | User loads `/` | Baseline Traffic |
| `audit_started` | User adds their first tool row on `/audit` | Intake Engagement (>60%) |
| `audit_submitted` | User clicks "Generate Audit Report" and schema passes | Form Completion (>70%) |
| `results_viewed` | Server Action succeeds and `/results/[id]` hydrates | Engine Reliability (>99.5%) |
| `lead_captured` | User enters email in CTA card and server persists | Lead Conversion (>30%) |
| `report_shared` | User clicks Copy Link, Share on X, or Share on LinkedIn | Viral Expansion Rate (>10%) |

---

## 3. Product Value & Engagement Metrics

These metrics verify if the deterministic audit engine is delivering high-value, actionable insights:

- **Average Monthly Savings Identified (AMSI):**
  - *Formula:* $\sum(\text{Annual Savings of Audits}) / (12 \times \text{Total Audits})$
  - *Goal:* $> \$120/\text{month}$ (Founders won't act on less than $100/mo. If this drops, we must adjust catalog rules or target larger teams).
- **Recommendation Density:**
  - *Formula:* Total recommendations generated / Total audits run.
  - *Goal:* $1.8 \text{ to } 3.0$ recommendations per stack. (Too low means the engine is too passive; too high means we are overwhelming the user with minor details).
- **Alternative Adoption Rate:**
  - *Formula:* Recommendations for Cursor → Windsurf clicked / Total alternative recommendations shown.
  - *Goal:* $> 15.0\%$ (Measures willingness of founders to switch platforms based on our recommendations).

---

## 4. Technical & Operational Health

We track system performance to keep the experience fast and error-free:

- **Server Action Latency (P95):** The time taken to process `runAndSaveAuditAction`, write to Supabase, call Gemini, and return the ID. Target: **< 1,500ms** (without Gemini) or **< 3,500ms** (with Gemini).
- **AI Fallback Trigger Rate:** The percentage of audits that fall back to the local, deterministic text template instead of Gemini narrative due to keys missing, network failure, or timeouts. Target: **< 2.0%**.
- **API Failure Fallback Rate:** The percentage of clients who fail Server Actions 3 times and fall back to local `sessionStorage` execution. Target: **< 0.5%**.
- **Rate Limit Block Rate:** The number of requests blocked by `checkRateLimit`. A sudden spike indicates a scrap-bot or DDoS attempt.

---

## 5. Early Launch Targets (PH Launch Week)

- **Unique Visitors:** 2,000+
- **Completed Audits:** 800+
- **Emails Captured (WLQA):** 240+ (Targeting a 30% conversion rate from Results → Lead)
- **Shared Links Generated:** 40+
- **Average Identified Annual Savings:** $850+ per startup stack
