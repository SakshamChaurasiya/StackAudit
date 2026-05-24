/**
 * Rule: Unused tier / seat floor waste.
 *
 * Some vendor plans enforce a minimum seat count. If the user is paying for
 * fewer seats than the floor, they are being charged for unused seats.
 *
 * Current seat floors from the pricing catalog:
 * - Claude Team: minSeats = 5
 * - ChatGPT Team: minSeats = 2
 *
 * This rule calculates the dollar cost of the wasted seats and suggests
 * either downgrading to a plan without a seat floor or adding team members
 * to justify the spend.
 */

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

/**
 * Returns unused-tier recommendations for plans with a minSeats floor
 * where the user's reported seat count is below that floor.
 */
export function detectUnusedTier(
  input: AuditInput,
  enriched: EnrichedTool[],
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];

  for (const row of enriched) {
    const { tool, plan, seats, label, planLabel } = row;

    const listPrice = plan.listPrice;
    if (!listPrice) continue;
    if (!listPrice.perSeat) continue;

    const minSeats = listPrice.minSeats;
    if (!minSeats || minSeats <= 1) continue;

    // Only fire when actual seats < minimum required
    if (seats >= minSeats) continue;

    const wastedSeats = minSeats - seats;
    const wastedCost = Math.round(wastedSeats * listPrice.amountUsd * 100) / 100;

    if (wastedCost <= 0) continue;

    // Find a no-floor alternative plan on the same tool
    const toolEntry = PRICING_CATALOG.tools[tool];
    const fallbackPlan = toolEntry?.plans.find(
      (p) =>
        p.id !== plan.id &&
        (p.listPrice === null ||
          !p.listPrice.perSeat ||
          !p.listPrice.minSeats),
    );
    const fallbackNote = fallbackPlan
      ? ` Consider switching to ${label} ${fallbackPlan.label} which has no seat minimum.`
      : "";

    recs.push({
      id: `unused-tier-${tool}-${plan.id}`,
      type: "unused-tier",
      toolId: tool,
      targetPlanId: fallbackPlan?.id,
      title: `${label} ${planLabel} charges for ${wastedSeats} unused seat${wastedSeats !== 1 ? "s" : ""} — $${wastedCost}/mo wasted`,
      reasoning:
        `${label} ${planLabel} enforces a minimum of ${minSeats} seats at $${listPrice.amountUsd}/seat/mo. ` +
        `You have ${seats} seat${seats !== 1 ? "s" : ""}, meaning ${wastedSeats} seat${wastedSeats !== 1 ? "s" : ""} ` +
        `(worth $${wastedCost}/mo, $${wastedCost * 12}/yr) are paid but unused.` +
        fallbackNote,
      monthlySaving: wastedCost,
      annualSaving: Math.round(wastedCost * 12),
    });
  }

  return recs;
}
