import type { SupportedTool } from "@/types";

/** Bump when list prices or plan IDs change materially. */
export const PRICING_CATALOG_VERSION = "2026.05.23";

export const PRICING_CATALOG_UPDATED_AT = "2026-05-23";

export const SUPPORTED_TOOLS = [
  "cursor",
  "github-copilot",
  "claude",
  "chatgpt",
  "anthropic-api",
  "openai-api",
  "gemini",
  "windsurf",
  "v0",
] as const satisfies readonly SupportedTool[];

export const MAX_PLANS_PER_TOOL = 12;
