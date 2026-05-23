import type { PriceSource } from "@/lib/pricing/types";

/**
 * Source registry — every priced plan references a sourceId from this map.
 * Update checkedAt when re-verifying vendor pricing pages.
 */
export const PRICING_SOURCES: Record<string, PriceSource> = {
  "cursor-pricing": {
    id: "cursor-pricing",
    vendor: "Cursor",
    url: "https://www.cursor.com/pricing",
    checkedAt: "2026-05-23",
  },
  "github-copilot-pricing": {
    id: "github-copilot-pricing",
    vendor: "GitHub",
    url: "https://github.com/features/copilot/plans",
    checkedAt: "2026-05-23",
  },
  "anthropic-claude-pricing": {
    id: "anthropic-claude-pricing",
    vendor: "Anthropic",
    url: "https://www.anthropic.com/pricing",
    checkedAt: "2026-05-23",
  },
  "openai-chatgpt-pricing": {
    id: "openai-chatgpt-pricing",
    vendor: "OpenAI",
    url: "https://openai.com/chatgpt/pricing",
    checkedAt: "2026-05-23",
  },
  "openai-api-pricing": {
    id: "openai-api-pricing",
    vendor: "OpenAI",
    url: "https://openai.com/api/pricing",
    checkedAt: "2026-05-23",
  },
  "anthropic-api-pricing": {
    id: "anthropic-api-pricing",
    vendor: "Anthropic",
    url: "https://www.anthropic.com/pricing",
    checkedAt: "2026-05-23",
  },
  "google-gemini-pricing": {
    id: "google-gemini-pricing",
    vendor: "Google",
    url: "https://one.google.com/about/plans",
    checkedAt: "2026-05-23",
  },
  "google-ai-studio": {
    id: "google-ai-studio",
    vendor: "Google",
    url: "https://ai.google.dev/pricing",
    checkedAt: "2026-05-23",
  },
  "windsurf-pricing": {
    id: "windsurf-pricing",
    vendor: "Windsurf",
    url: "https://windsurf.com/pricing",
    checkedAt: "2026-05-23",
  },
  "v0-pricing": {
    id: "v0-pricing",
    vendor: "Vercel v0",
    url: "https://v0.dev/pricing",
    checkedAt: "2026-05-23",
  },
  "vendor-free-tier": {
    id: "vendor-free-tier",
    vendor: "Various",
    url: "https://example.com",
    checkedAt: "2026-05-23",
    notes: "Documented $0 tier — verify vendor free plan limits separately.",
  },
};

export function getPriceSource(sourceId: string): PriceSource | undefined {
  return PRICING_SOURCES[sourceId];
}

export function listPriceSources(): PriceSource[] {
  return Object.values(PRICING_SOURCES);
}
