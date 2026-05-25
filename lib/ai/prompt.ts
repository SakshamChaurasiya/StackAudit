import type { AuditResult } from "@/lib/audit-engine/types";

/**
 * Builds the structured Gemini prompt for personalized audit summary generation.
 *
 * Constraints enforced in the prompt:
 * - Output must be ~80–120 words
 * - Only figures from the engine result may be cited (no invented numbers)
 * - Professional, actionable, encouraging tone for a startup founder audience
 */
export function buildAuditSummaryPrompt(result: AuditResult): string {
  const { input, summary, recommendations } = result;

  const toolList = input.tools
    .map((t) => `${t.tool} (${t.plan}, $${t.monthlySpend}/mo)`)
    .join(", ");

  const topRecs = recommendations
    .slice(0, 2)
    .map((r, i) => `${i + 1}. ${r.title} — save $${r.monthlySaving}/mo`)
    .join("\n");

  const monthlySaving = summary.totalMonthlySaving.toFixed(0);
  const annualSaving = summary.totalAnnualSaving.toFixed(0);
  const totalSpend = summary.totalMonthlySpend.toFixed(0);
  const teamSize = input.teamSize;

  return `You are StackAudit's financial advisor. Write a concise, personalized ~100-word summary for a startup founder after analyzing their AI tool stack.

Team size: ${teamSize} people
Current AI tools: ${toolList}
Monthly spend: $${totalSpend}
Potential monthly savings: $${monthlySaving} (annual: $${annualSaving})
Top recommendations:
${topRecs || "Stack is already well-optimized."}

Requirements:
- Write exactly 80–120 words
- Reference the specific tools, spend figures, and recommendations listed above
- Do NOT invent any numbers not provided above
- Professional, encouraging, and actionable tone
- No markdown formatting — plain paragraph only
- Start directly with the summary (no preamble like "Here is your summary:")`;
}
