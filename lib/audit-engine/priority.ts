/**
 * Recommendation priority scoring.
 *
 * P1 — Highest urgency / largest dollar impact.
 * P2 — Moderate impact or structural inefficiency.
 * P3 — Low-dollar optimisation or nice-to-have switch.
 */

import type {
  Recommendation,
  RecommendationPriority,
  RecommendationType,
} from "@/lib/audit-engine/types";

/** Monthly saving thresholds in USD. */
const THRESHOLDS = {
  P1: 50, // ≥ $50/mo savings → always P1
  P2: 20, // ≥ $20/mo savings → P2 at minimum
} as const;

/** Some rule types warrant elevated priority regardless of dollar amount. */
const ELEVATED_TYPES: RecommendationType[] = ["redundant", "unused-tier"];

/**
 * Returns the priority tier for a single recommendation.
 *
 * Rules (evaluated in order — first match wins):
 * 1. Redundant or unused-tier rules → P1 (structural waste).
 * 2. Monthly saving ≥ $50 → P1.
 * 3. Monthly saving ≥ $20 → P2.
 * 4. Everything else → P3.
 */
export function scoreRecommendationPriority(
  type: RecommendationType,
  monthlySaving: number,
): RecommendationPriority {
  if (ELEVATED_TYPES.includes(type)) return 1;
  if (monthlySaving >= THRESHOLDS.P1) return 1;
  if (monthlySaving >= THRESHOLDS.P2) return 2;
  return 3;
}

/**
 * Sorts recommendations:
 * 1. Priority ascending (P1 before P3).
 * 2. Monthly saving descending within each priority tier.
 */
export function sortRecommendations(
  recs: Recommendation[],
): Recommendation[] {
  return [...recs].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.monthlySaving - a.monthlySaving;
  });
}

/**
 * Applies priority scores to a list of un-scored recommendations.
 * Returns a new array (immutable).
 */
export function applyPriorities(
  recs: Omit<Recommendation, "priority">[],
): Recommendation[] {
  return recs.map((rec) => ({
    ...rec,
    priority: scoreRecommendationPriority(rec.type, rec.monthlySaving),
  }));
}
