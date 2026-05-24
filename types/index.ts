/** Shared domain types */

export type { AuditFormValues, ToolRowValues } from "@/types/audit-form";

export type {
  AuditInput,
  AuditResult,
  AuditSummary,
  Recommendation,
  RecommendationPriority,
  RecommendationType,
  ToolAuditInput,
} from "@/lib/audit-engine/types";

export type {
  BillingModel,
  NormalizedPlan,
  NormalizedTool,
  PricingCatalog,
} from "@/lib/pricing/types";

export type SupportedTool =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf"
  | "v0";
