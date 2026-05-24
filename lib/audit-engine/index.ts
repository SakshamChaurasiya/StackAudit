/**
 * Public API for the audit engine.
 *
 * Import from "@/lib/audit-engine" in server actions, API routes, and tests.
 */

export { runAudit } from "@/lib/audit-engine/engine";

export type {
  AuditInput,
  AuditResult,
  AuditSummary,
  Recommendation,
  RecommendationType,
  RecommendationPriority,
  ToolAuditInput,
} from "@/lib/audit-engine/types";

export {
  calcSummary,
  calcTotalMonthlySpend,
  calcTotalMonthlySaving,
  calcSavingsPercent,
  calcOverspendAmount,
  toAnnual,
} from "@/lib/audit-engine/calculator";

export {
  scoreRecommendationPriority,
  sortRecommendations,
} from "@/lib/audit-engine/priority";
