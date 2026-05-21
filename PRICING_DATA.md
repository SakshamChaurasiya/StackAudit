# Pricing Data

> Single source of truth documentation for hardcoded pricing in `lib/pricing/` and `data/`.

## Status

**Phase 0** — structure only. Pricing tables added in Phase 3 with the audit engine.

## Supported tools

| Tool            | Slug              | Notes                    |
| --------------- | ----------------- | ------------------------ |
| Cursor          | `cursor`          | Pro / Business           |
| GitHub Copilot  | `github-copilot`  | Individual / Business    |
| Claude          | `claude`          | Pro / Team               |
| ChatGPT         | `chatgpt`         | Plus / Team / Enterprise |
| Anthropic API   | `anthropic-api`   | Usage-based              |
| OpenAI API      | `openai-api`      | Usage-based              |
| Gemini          | `gemini`          | Advanced / API           |
| Windsurf / v0   | `windsurf` / `v0` | Plan tiers TBD           |

## Source policy

- Record **URL**, **date checked**, and **list price** for each tier.
- Round to whole dollars for recommendations unless API usage needs cents.
- Re-check before production launch; AI pricing changes frequently.

## Example entry format

```markdown
### ChatGPT Team
- **Price:** $25/user/mo (min 2 users)
- **Source:** https://openai.com/chatgpt/pricing
- **Checked:** YYYY-MM-DD
```

## Changelog

| Date       | Change                    |
| ---------- | ------------------------- |
| 2026-05-21 | Initial doc stub (Phase 0)|
