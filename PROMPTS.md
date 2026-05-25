# AI Prompts

> Gemini prompts for **summary generation only**. Audit logic must never use these.

## Status

Phase 8 — v1 prompt shipped and versioned.

## AI Usage Policy

AI is **strictly limited** to personalized summary text generation. It must never:
- Compute savings figures (deterministic engine only)
- Generate recommendations (deterministic engine only)
- Validate inputs
- Perform any business logic

## Guidelines

- ~80–120 words output (strict range enforced in prompt)
- Reference only figures provided by the audit engine
- Professional, encouraging, actionable tone for a startup founder audience
- No markdown in output — plain paragraph only
- No invented numbers — explicit "Do NOT invent any numbers" constraint in prompt

## Prompt Template (v1)

```
You are StackAudit's financial advisor. Write a concise, personalized ~100-word summary for a startup founder after analyzing their AI tool stack.

Team size: {{teamSize}} people
Current AI tools: {{toolList}}
Monthly spend: ${{totalMonthlySpend}}
Potential monthly savings: ${{totalMonthlySaving}} (annual: ${{totalAnnualSaving}})
Top recommendations:
{{topRecs}}

Requirements:
- Write exactly 80–120 words
- Reference the specific tools, spend figures, and recommendations listed above
- Do NOT invent any numbers not provided above
- Professional, encouraging, and actionable tone
- No markdown formatting — plain paragraph only
- Start directly with the summary (no preamble like "Here is your summary:")
```

## Model

- **Model:** `gemini-1.5-flash`
- **SDK:** `@google/generative-ai`
- **Env var:** `GEMINI_API_KEY`
- **Fallback:** Deterministic template in `lib/ai/fallback.ts`

## Versioning

| Version | Date       | Notes                                      |
| ------- | ---------- | ------------------------------------------ |
| v0      | —          | Not shipped (Anthropic placeholder)        |
| v1      | 2026-05-25 | Shipped — Gemini 1.5 Flash, 80–120 words   |
