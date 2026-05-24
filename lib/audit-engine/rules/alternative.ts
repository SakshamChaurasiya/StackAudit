/**
 * Rule: Cheaper alternative tool suggestion.
 *
 * Suggests switching to a different tool in the same category that costs less,
 * when the alternative is materially equivalent for the reported use case.
 *
 * Hardcoded alternative pairs — no AI inference.
 * This rule only fires if no redundancy recommendation already covers the same pair.
 */

import { estimateMonthlyListCost } from "@/lib/pricing/models";
import { PRICING_CATALOG } from "@/lib/pricing";
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

/** Hardcoded alternative suggestions. */
const ALTERNATIVE_RULES: {
  fromToolId: SupportedTool;
  fromPlanId: string;
  toToolId: SupportedTool;
  toPlanId: string;
  maxSeats: number;
  justification: string;
}[] = [
  // Cursor Pro ($20/mo) → Windsurf Pro ($15/mo) for small teams
  {
    fromToolId: "cursor",
    fromPlanId: "pro",
    toToolId: "windsurf",
    toPlanId: "pro",
    maxSeats: 5,
    justification:
      "Windsurf Pro offers comparable AI code completions and a built-in agentic " +
      "flow model at $15/mo — $5 less than Cursor Pro. For teams that don't rely on " +
      "Cursor-specific integrations, this is a straightforward cost reduction.",
  },
];

/**
 * Returns alternative-tool recommendations.
 * Skips pairs already covered by a redundancy recommendation.
 */
export function detectAlternatives(
  input: AuditInput,
  enriched: EnrichedTool[],
  firedRedundantPairs: Set<string>,
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];

  for (const row of enriched) {
    const { tool, plan, seats, label } = row;

    const rule = ALTERNATIVE_RULES.find(
      (r) => r.fromToolId === tool && r.fromPlanId === plan.id,
    );
    if (!rule) continue;
    if (seats > rule.maxSeats) continue;

    // Skip if a redundancy recommendation already covers this pair
    const pairKey = [tool, rule.toToolId].sort().join("|");
    if (firedRedundantPairs.has(pairKey)) continue;

    // Make sure the alternative tool is not already in the stack
    const alreadyInStack = input.tools.some((t) => t.tool === rule.toToolId);
    if (alreadyInStack) continue;

    // Resolve target plan cost
    const targetToolEntry = PRICING_CATALOG.tools[rule.toToolId];
    const targetPlan = targetToolEntry?.plans.find((p) => p.id === rule.toPlanId);
    if (!targetPlan) continue;

    const currentCost = estimateMonthlyListCost(plan, seats) ?? 0;
    const targetCost = estimateMonthlyListCost(targetPlan, seats) ?? 0;
    const saving = Math.round((currentCost - targetCost) * 100) / 100;
    if (saving <= 0) continue;

    const toLabel = targetToolEntry.label;
    const toPlanLabel = targetPlan.label;

    recs.push({
      id: `alternative-${tool}-to-${rule.toToolId}`,
      type: "alternative",
      toolId: tool,
      alternativeToolId: rule.toToolId,
      targetPlanId: rule.toPlanId,
      title: `Switch from ${label} to ${toLabel} — save $${saving}/mo`,
      reasoning:
        `You're paying ~$${currentCost}/mo for ${label} ${plan.label}. ` +
        `${rule.justification} ` +
        `${toLabel} ${toPlanLabel} costs ~$${targetCost}/mo — saving $${saving}/mo ($${saving * 12}/yr).`,
      monthlySaving: saving,
      annualSaving: Math.round(saving * 12),
    });
  }

  return recs;
}
