import type { SupportedTool } from "@/types";

export type BillingType = "seat" | "flat" | "usage";

export type PlanOption = {
  id: string;
  label: string;
};

export type ToolCatalogEntry = {
  id: SupportedTool;
  label: string;
  billingType: BillingType;
  plans: PlanOption[];
};

/** Plan catalog for form selectors — prices finalized in Phase 4 audit engine. */
export const TOOL_CATALOG: Record<SupportedTool, ToolCatalogEntry> = {
  cursor: {
    id: "cursor",
    label: "Cursor",
    billingType: "seat",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro" },
      { id: "business", label: "Business" },
    ],
  },
  "github-copilot": {
    id: "github-copilot",
    label: "GitHub Copilot",
    billingType: "seat",
    plans: [
      { id: "individual", label: "Individual" },
      { id: "business", label: "Business" },
      { id: "enterprise", label: "Enterprise" },
    ],
  },
  claude: {
    id: "claude",
    label: "Claude",
    billingType: "flat",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro" },
      { id: "team", label: "Team" },
    ],
  },
  chatgpt: {
    id: "chatgpt",
    label: "ChatGPT",
    billingType: "flat",
    plans: [
      { id: "free", label: "Free" },
      { id: "plus", label: "Plus" },
      { id: "team", label: "Team" },
      { id: "enterprise", label: "Enterprise" },
    ],
  },
  "anthropic-api": {
    id: "anthropic-api",
    label: "Anthropic API",
    billingType: "usage",
    plans: [
      { id: "pay-as-you-go", label: "Pay as you go" },
      { id: "committed", label: "Committed use" },
    ],
  },
  "openai-api": {
    id: "openai-api",
    label: "OpenAI API",
    billingType: "usage",
    plans: [
      { id: "pay-as-you-go", label: "Pay as you go" },
      { id: "prepaid", label: "Prepaid credits" },
    ],
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    billingType: "flat",
    plans: [
      { id: "free", label: "Free" },
      { id: "advanced", label: "Advanced" },
      { id: "api", label: "API / Vertex" },
    ],
  },
  windsurf: {
    id: "windsurf",
    label: "Windsurf",
    billingType: "seat",
    plans: [
      { id: "free", label: "Free" },
      { id: "pro", label: "Pro" },
      { id: "teams", label: "Teams" },
    ],
  },
  v0: {
    id: "v0",
    label: "v0",
    billingType: "flat",
    plans: [
      { id: "free", label: "Free" },
      { id: "premium", label: "Premium" },
      { id: "team", label: "Team" },
    ],
  },
};

export const TOOL_OPTIONS = Object.values(TOOL_CATALOG).map((t) => ({
  value: t.id,
  label: t.label,
}));

export function getToolEntry(tool: SupportedTool): ToolCatalogEntry {
  return TOOL_CATALOG[tool];
}

export function getPlansForTool(tool: SupportedTool): PlanOption[] {
  return TOOL_CATALOG[tool].plans;
}

export function toolRequiresSeats(tool: SupportedTool): boolean {
  return TOOL_CATALOG[tool].billingType === "seat";
}

export function getDefaultPlanForTool(tool: SupportedTool): string {
  return TOOL_CATALOG[tool].plans[0]?.id ?? "";
}

export function isValidPlanForTool(tool: SupportedTool, planId: string): boolean {
  return TOOL_CATALOG[tool].plans.some((p) => p.id === planId);
}

const ALL_TOOLS = Object.keys(TOOL_CATALOG) as SupportedTool[];

export function findUnusedTool(used: SupportedTool[]): SupportedTool | null {
  return ALL_TOOLS.find((t) => !used.includes(t)) ?? null;
}
