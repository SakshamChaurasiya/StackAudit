import type { AuditResult } from "@/lib/audit-engine/types";

/**
 * Generates a deterministic, template-driven fallback summary.
 *
 * Used when:
 * - GEMINI_API_KEY is not configured
 * - The Gemini API call fails for any reason
 *
 * Always produces a meaningful, data-accurate summary using only engine figures.
 * Zero API calls — always available.
 */
export function generateFallbackSummary(result: AuditResult): string {
  const { input, summary, recommendations } = result;
  const { totalMonthlySpend, totalAnnualSaving, totalMonthlySaving, savingsPercent, toolCount, recommendationCount } = summary;

  const toolNames = input.tools.map((t) => t.tool).join(", ");
  const topRec = recommendations[0];

  if (totalMonthlySaving === 0 || recommendationCount === 0) {
    return `Your ${toolCount}-tool AI stack (${toolNames}) at $${totalMonthlySpend.toFixed(0)}/month is well-optimized. You're on appropriate plans for your team size of ${input.teamSize}. No immediate cost savings were identified — great work maintaining a lean stack. Continue reviewing quarterly as your team grows and new tools enter the market.`;
  }

  const topRecText = topRec
    ? ` The highest-impact action is to ${topRec.title.toLowerCase()}, saving $${topRec.monthlySaving}/month.`
    : "";

  return `Your ${toolCount}-tool AI stack (${toolNames}) costs $${totalMonthlySpend.toFixed(0)}/month. StackAudit identified ${recommendationCount} optimization${recommendationCount !== 1 ? "s" : ""} that could save you $${totalMonthlySaving.toFixed(0)}/month — $${totalAnnualSaving.toFixed(0)} annually (${savingsPercent}% of current spend).${topRecText} Implementing these changes will right-size your AI investment for your ${input.teamSize}-person team.`;
}
