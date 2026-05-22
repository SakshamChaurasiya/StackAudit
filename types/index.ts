/** Shared domain types */

export type { AuditFormValues, ToolRowValues } from "@/types/audit-form";

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
