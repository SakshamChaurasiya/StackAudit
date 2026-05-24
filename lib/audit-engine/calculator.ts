/**
 * Pure financial math utilities for the audit engine.
 * All functions are deterministic, side-effect-free, and unit-testable.
 */

import {
  estimateMonthlyListCost,
  annualizeMonthly,
} from "@/lib/pricing/models";
import type { NormalizedPlan } from "@/lib/pricing/types";
import type { AuditInput, AuditSummary, Recommendation } from "@/lib/audit-engine/types";

// ─── Per-tool cost helpers ────────────────────────────────────────────────────

/**
 * Monthly list cost for a resolved plan at a given seat count.
 * Falls back to 0 for free / pure-usage plans with no list anchor.
 */
export function planMonthlyCost(plan: NormalizedPlan, seats: number): number {
  const estimate = estimateMonthlyListCost(plan, seats);
  return estimate ?? 0;
}

/**
 * Annual cost from a monthly amount.
 */
export function toAnnual(monthly: number): number {
  return annualizeMonthly(monthly);
}

// ─── Stack-level aggregates ───────────────────────────────────────────────────

/**
 * Total user-reported monthly spend across all tool rows.
 */
export function calcTotalMonthlySpend(input: AuditInput): number {
  return input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
}

/**
 * Total estimated catalog list cost across all tool rows.
 * Requires resolved plans; pass a pre-built map.
 */
export function calcTotalListCost(
  resolvedCosts: number[],
): number {
  return resolvedCosts.reduce((sum, c) => sum + c, 0);
}

/**
 * Amount by which reported spend exceeds total list cost.
 * Returns 0 if reported spend is at or under list.
 */
export function calcOverspendAmount(reported: number, list: number): number {
  const delta = reported - list;
  return delta > 0 ? Math.round(delta * 100) / 100 : 0;
}

/**
 * Total monthly saving from a list of recommendations.
 * Deduplicates overlapping tool savings to avoid double-counting:
 * if multiple recs target the same tool, only the highest saving counts.
 */
export function calcTotalMonthlySaving(recs: Recommendation[]): number {
  const byTool = new Map<string, number>();
  for (const rec of recs) {
    const key = rec.toolId;
    const existing = byTool.get(key) ?? 0;
    if (rec.monthlySaving > existing) {
      byTool.set(key, rec.monthlySaving);
    }
  }
  const raw = Array.from(byTool.values()).reduce((sum, v) => sum + v, 0);
  return Math.round(raw * 100) / 100;
}

/**
 * Savings as a percentage of total reported spend.
 * Returns 0 if spend is 0. Rounded to one decimal place.
 */
export function calcSavingsPercent(saving: number, totalSpend: number): number {
  if (totalSpend <= 0) return 0;
  return Math.round((saving / totalSpend) * 1000) / 10;
}

// ─── Summary builder ─────────────────────────────────────────────────────────

/**
 * Builds the full AuditSummary from engine inputs and computed recs.
 */
export function calcSummary(
  input: AuditInput,
  resolvedListCosts: number[],
  recommendations: Recommendation[],
): AuditSummary {
  const totalMonthlySpend = calcTotalMonthlySpend(input);
  const estimatedMonthlyListCost = calcTotalListCost(resolvedListCosts);
  const overspendAmount = calcOverspendAmount(
    totalMonthlySpend,
    estimatedMonthlyListCost,
  );
  const totalMonthlySaving = calcTotalMonthlySaving(recommendations);
  const totalAnnualSaving = toAnnual(totalMonthlySaving);
  const savingsPercent = calcSavingsPercent(totalMonthlySaving, totalMonthlySpend);

  return {
    totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100,
    totalAnnualSpend: toAnnual(totalMonthlySpend),
    estimatedMonthlyListCost: Math.round(estimatedMonthlyListCost * 100) / 100,
    overspendAmount,
    totalMonthlySaving,
    totalAnnualSaving,
    savingsPercent,
    toolCount: input.tools.length,
    recommendationCount: recommendations.length,
  };
}
