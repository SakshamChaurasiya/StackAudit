import type {
  BillingModel,
  NormalizedPlan,
  NormalizedPrice,
  NormalizedTool,
} from "@/lib/pricing/types";
import type { SupportedTool } from "@/types";

/**
 * Estimated monthly list cost for a plan at a given seat count.
 * Returns null when no list anchor exists (free / pure usage).
 */
export function estimateMonthlyListCost(
  plan: NormalizedPlan,
  seats: number = 1,
): number | null {
  const price = plan.listPrice;
  if (!price) return 0;
  if (plan.billingModel === "usage" && price.amountUsd === 0) {
    return null;
  }

  if (price.perSeat) {
    const effectiveSeats = Math.max(seats, price.minSeats ?? 1);
    return price.amountUsd * effectiveSeats;
  }

  return price.amountUsd;
}

/** Annualized list cost from monthly estimate. */
export function annualizeMonthly(amount: number): number {
  return Math.round(amount * 12);
}

export function isSeatBasedPlan(plan: NormalizedPlan): boolean {
  return (
    plan.billingModel === "seat" ||
    (plan.listPrice?.perSeat ?? false)
  );
}

export function isUsageBasedPlan(plan: NormalizedPlan): boolean {
  return plan.billingModel === "usage";
}

export function isFreePlan(plan: NormalizedPlan): boolean {
  return plan.listPrice === null || plan.id === "free";
}

export function formatPrice(price: NormalizedPrice): string {
  const base = `$${price.amountUsd}`;
  const period = price.period === "month" ? "/mo" : "/yr";
  const seat = price.perSeat ? " per seat" : "";
  const min = price.minSeats ? ` (min ${price.minSeats} seats)` : "";
  return `${base}${period}${seat}${min}`;
}

export function getToolBillingModel(tool: NormalizedTool): BillingModel {
  return tool.defaultBillingModel;
}

export function planRequiresSeatsInput(
  tool: NormalizedTool,
  planId: string,
): boolean {
  const plan = tool.plans.find((p) => p.id === planId);
  if (!plan) return tool.metadata.requiresSeats;
  return isSeatBasedPlan(plan);
}

export function getOverlapCandidates(
  tool: NormalizedTool,
): SupportedTool[] {
  return tool.metadata.overlapsWith ?? [];
}
