# AI Prompts

> Anthropic prompts for **summary generation only**. Audit logic must never use these.

## Status

Phase 6 — prompts will be versioned here when implemented.

## Guidelines

- ~100 words output
- Reference user's tools, spend, and top 1–2 recommendations from engine output
- Professional, actionable tone
- No invented savings numbers — only use engine-provided figures

## Prompt template (draft)

```
You are StackAudit's financial advisor. Write a ~100 word summary for a startup founder.

Their stack: {{tools}}
Monthly spend: ${{totalMonthly}}
Top recommendations:
{{recommendations}}

Be specific, encouraging, and professional. Do not invent numbers not listed above.
```

## Versioning

| Version | Date | Notes     |
| ------- | ---- | --------- |
| v0      | —    | Not shipped |
