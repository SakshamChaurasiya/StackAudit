/**
 * Rule: API-vs-chat seat arbitrage.
 *
 * Engineers and developers paying flat subscription prices for chat assistants
 * (Claude Pro, ChatGPT Plus) at high usage levels often pay more than they would
 * on direct API billing. This rule flags that opportunity.
 *
 * Firing conditions:
 * - Tool is a flat-subscription assistant (Claude Pro / ChatGPT Plus).
 * - useCase is "engineering" or "product" (technical users who can use APIs).
 * - Reported monthly spend per seat exceeds the API_CONSIDERATION_THRESHOLD.
 * - The corresponding API tool is NOT already in the user's stack.
 */

import type { NormalizedPlan } from "@/lib/pricing/types";
import type { AuditInput, Recommendation } from "@/lib/audit-engine/types";
import type { SupportedTool } from "@/types";

type EnrichedTool = {
  tool: SupportedTool;
  plan: NormalizedPlan;
  monthlySpend: number;
  seats: number;
  label: string;
  planLabel: string;
};

/** Monthly spend per-seat above which API access becomes worth evaluating. */
const API_CONSIDERATION_THRESHOLD = 20;

/** Use cases where API access is a practical suggestion. */
const TECHNICAL_USE_CASES = ["engineering", "product"] as const;

/** Map from chat tool to its corresponding API tool. */
const CHAT_TO_API_MAP: Partial<Record<SupportedTool, SupportedTool>> = {
  claude: "anthropic-api",
  chatgpt: "openai-api",
};

/** Plans that are flat-subscription (not free, not team/enterprise). */
const SUBSCRIPTION_PLAN_IDS = ["pro", "plus"] as const;

/**
 * Returns API-switch recommendations for applicable tool rows.
 */
export function detectApiSwitch(
  input: AuditInput,
  enriched: EnrichedTool[],
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];

  // Build the set of API tools already in the stack
  const stackTools = new Set(input.tools.map((t) => t.tool));

  for (const row of enriched) {
    const { tool, plan, monthlySpend, seats, label, planLabel } = row;

    // Only target chat subscription tools
    const apiAlternative = CHAT_TO_API_MAP[tool];
    if (!apiAlternative) continue;

    // Only target flat subscription plans (not free/team/enterprise)
    if (!(SUBSCRIPTION_PLAN_IDS as readonly string[]).includes(plan.id)) continue;

    // Only for technical use cases
    const inputRow = input.tools.find((t) => t.tool === tool);
    if (!inputRow) continue;
    if (!(TECHNICAL_USE_CASES as readonly string[]).includes(inputRow.useCase)) continue;

    // Don't fire if the API tool is already in the stack
    if (stackTools.has(apiAlternative)) continue;

    // Spend per seat must exceed the threshold
    const effectiveSeats = seats > 0 ? seats : 1;
    const spendPerSeat = monthlySpend / effectiveSeats;
    if (spendPerSeat <= API_CONSIDERATION_THRESHOLD) continue;

    // Estimated saving: conservative 20% estimate (API can be cheaper at volume)
    // We do not fabricate exact API savings — instead we flag it as an evaluation
    // and show the current spend. The saving here is capped conservatively.
    const conservativeSaving = Math.round(monthlySpend * 0.2 * 100) / 100;

    const apiToolLabels: Record<SupportedTool, string> = {
      "anthropic-api": "Anthropic API",
      "openai-api": "OpenAI API",
    } as Partial<Record<SupportedTool, string>> as Record<SupportedTool, string>;
    const apiLabel = apiToolLabels[apiAlternative] ?? apiAlternative;

    recs.push({
      id: `api-switch-${tool}`,
      type: "api-switch",
      toolId: tool,
      alternativeToolId: apiAlternative,
      title: `Consider ${apiLabel} instead of ${label} ${planLabel} for engineering use`,
      reasoning:
        `You're paying $${monthlySpend}/mo for ${label} ${planLabel} on engineering workflows. ` +
        `At this spend level, the ${apiLabel} (token-based billing) may be more cost-efficient — ` +
        `especially if your team's usage is concentrated in coding tasks with predictable prompt patterns. ` +
        `API access also unlocks fine-grained model control and system prompts. ` +
        `Estimated saving potential: ~$${conservativeSaving}/mo ($${conservativeSaving * 12}/yr) at current usage.`,
      monthlySaving: conservativeSaving,
      annualSaving: Math.round(conservativeSaving * 12),
    });
  }

  return recs;
}
