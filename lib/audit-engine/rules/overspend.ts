/**
 * Rule: Overspend vs. published list price.
 *
 * Fires when a user's reported monthly spend exceeds the catalog list price
 * by more than OVERSPEND_THRESHOLD (15%). This gap indicates misconfigured
 * billing, seat creep, or unused allocations.
 */

import { estimateMonthlyListCost } from "@/lib/pricing/models";
import type { NormalizedPlan } from "@/lib/pricing/types";
import type { AuditInput, Recommendation } from "@/lib/audit-engine/types";
import type { SupportedTool } from "@/types";

/** Reported spend must exceed list by this fraction to trigger the rule. */
export const OVERSPEND_THRESHOLD = 0.15;

type EnrichedTool = {
  tool: SupportedTool;
  plan: NormalizedPlan;
  monthlySpend: number;
  seats: number;
  label: string;
  planLabel: string;
};

/**
 * Returns overspend recommendations for every tool row where
 * reported spend > list × (1 + OVERSPEND_THRESHOLD).
 */
export function detectOverspend(
  input: AuditInput,
  enriched: EnrichedTool[],
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];

  for (const row of enriched) {
    const { tool, plan, monthlySpend, seats, label, planLabel } = row;

    // Usage-based plans with $0 list have no list anchor — skip.
    const listMonthly = estimateMonthlyListCost(plan, seats);
    if (listMonthly === null || listMonthly === 0) continue;

    const threshold = listMonthly * (1 + OVERSPEND_THRESHOLD);
    if (monthlySpend <= threshold) continue;

    const saving = Math.round((monthlySpend - listMonthly) * 100) / 100;
    const annualSaving = saving * 12;

    recs.push({
      id: `overspend-${tool}`,
      type: "overspend",
      toolId: tool,
      title: `${label} spend exceeds list price by $${saving}/mo`,
      reasoning:
        `You're reporting $${monthlySpend}/mo for ${label} ${planLabel}, ` +
        `but the published list price for ${seats} seat${seats !== 1 ? "s" : ""} is ` +
        `$${listMonthly}/mo. The $${saving}/mo gap often signals unused seats, ` +
        `a misaligned billing tier, or credits that should be renegotiated.`,
      monthlySaving: saving,
      annualSaving: Math.round(annualSaving),
    });
  }

  return recs;
}
