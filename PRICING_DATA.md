# Pricing Data

> Documentation for the centralized pricing layer in `lib/pricing/`.
> **Catalog version:** `2026.05.23` · **Last updated:** 2026-05-23

## Architecture

```
lib/pricing/
├── types.ts        # NormalizedPlan, NormalizedTool, PriceSource, …
├── constants.ts    # Version, SUPPORTED_TOOLS
├── sources.ts      # Vendor URLs + checkedAt (source registry)
├── data/
│   ├── tools.ts    # List prices per tool/plan (edit here)
│   └── index.ts    # buildPricingCatalog()
├── models.ts       # estimateMonthlyListCost, formatPrice, …
├── validate.ts     # Catalog integrity checks
├── catalog.ts      # Form-facing API (backward compatible)
└── index.ts        # Public exports + PRICING_CATALOG singleton
```

## Normalized object model

### `NormalizedPrice`

| Field | Type | Description |
| ----- | ---- | ----------- |
| `amountUsd` | number | List price in USD |
| `period` | `month` \| `year` | Billing period |
| `perSeat` | boolean | Multiply by seat count |
| `minSeats` | number? | Minimum billed seats (e.g. ChatGPT Team = 2) |
| `qualifier` | string? | Notes for usage / enterprise tiers |

### `NormalizedPlan`

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id` | string | Stable slug (used in form + engine) |
| `label` | string | Display name |
| `billingModel` | `seat` \| `flat` \| `usage` | Drives audit rules |
| `listPrice` | `NormalizedPrice` \| null | `null` = free tier |
| `sourceId` | string | Key into `PRICING_SOURCES` |

### `NormalizedTool`

| Field | Type | Description |
| ----- | ---- | ----------- |
| `id` | SupportedTool | Tool slug |
| `defaultBillingModel` | BillingModel | Default for tool family |
| `metadata` | ToolMetadata | Category, overlaps, `requiresSeats` |
| `plans` | NormalizedPlan[] | All tiers |

## Source mapping

Every priced plan references `sourceId` in `lib/pricing/sources.ts`.

| sourceId | Vendor | URL |
| -------- | ------ | --- |
| `cursor-pricing` | Cursor | https://www.cursor.com/pricing |
| `github-copilot-pricing` | GitHub | https://github.com/features/copilot/plans |
| `anthropic-claude-pricing` | Anthropic | https://www.anthropic.com/pricing |
| `openai-chatgpt-pricing` | OpenAI | https://openai.com/chatgpt/pricing |
| `openai-api-pricing` | OpenAI | https://openai.com/api/pricing |
| `anthropic-api-pricing` | Anthropic | https://www.anthropic.com/pricing |
| `google-gemini-pricing` | Google | https://one.google.com/about/plans |
| `google-ai-studio` | Google | https://ai.google.dev/pricing |
| `windsurf-pricing` | Windsurf | https://windsurf.com/pricing |
| `v0-pricing` | Vercel v0 | https://v0.dev/pricing |
| `vendor-free-tier` | Various | Documented $0 tiers |

## Supported tools & list prices (USD)

Prices rounded to whole dollars. Re-verify before launch.

### Cursor (`cursor`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| pro | flat | $20/mo | cursor-pricing |
| business | seat | $40/seat/mo | cursor-pricing |

### GitHub Copilot (`github-copilot`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| individual | flat | $10/mo | github-copilot-pricing |
| business | seat | $19/seat/mo | github-copilot-pricing |
| enterprise | seat | $39/seat/mo (indicative) | github-copilot-pricing |

### Claude (`claude`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| pro | flat | $20/mo | anthropic-claude-pricing |
| team | seat | $25/seat/mo (min 5) | anthropic-claude-pricing |

### ChatGPT (`chatgpt`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| plus | flat | $20/mo | openai-chatgpt-pricing |
| team | seat | $25/seat/mo (min 2) | openai-chatgpt-pricing |
| enterprise | seat | $60/seat/mo (indicative) | openai-chatgpt-pricing |

### Anthropic API (`anthropic-api`)

| Plan | Model | Notes |
| ---- | ----- | ----- |
| pay-as-you-go | usage | Token billing — use actual spend |
| committed | usage | Volume discounts |

### OpenAI API (`openai-api`)

| Plan | Model | Notes |
| ---- | ----- | ----- |
| pay-as-you-go | usage | Token billing |
| prepaid | usage | Prepaid credits |

### Gemini (`gemini`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| advanced | flat | $20/mo | google-gemini-pricing |
| api | usage | Vertex / AI Studio usage | google-ai-studio |

### Windsurf (`windsurf`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| pro | flat | $15/mo | windsurf-pricing |
| teams | seat | $30/seat/mo | windsurf-pricing |

### v0 (`v0`)

| Plan | Model | List price | Source |
| ---- | ----- | ---------- | ------ |
| free | flat | $0 | vendor-free-tier |
| premium | flat | $20/mo | v0-pricing |
| team | seat | $30/seat/mo (indicative) | v0-pricing |

## How to update pricing

1. Edit plan rows in `lib/pricing/data/tools.ts`
2. Add or update `sourceId` in `lib/pricing/sources.ts` with `checkedAt`
3. Bump `PRICING_CATALOG_VERSION` in `lib/pricing/constants.ts`
4. Run `npm test` — `tests/pricing/validate.test.ts` must pass
5. Update this file’s tables and changelog

## Utility functions

| Function | Module | Purpose |
| -------- | ------ | ------- |
| `estimateMonthlyListCost` | `models` | List $ for plan + seats |
| `annualizeMonthly` | `models` | ×12 for annual savings |
| `planRequiresSeatsInput` | `models` | Form seat field visibility |
| `validatePricingCatalog` | `validate` | CI integrity check |
| `getPriceSource` | `sources` | Lookup vendor URL |

## Changelog

| Date | Version | Change |
| ---- | ------- | ------ |
| 2026-05-21 | — | Initial doc stub (Phase 0) |
| 2026-05-23 | 2026.05.23 | Phase 4: normalized catalog, sources, validation, list prices |
