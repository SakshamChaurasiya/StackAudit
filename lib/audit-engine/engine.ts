/**
 * Audit engine orchestrator.
 *
 * runAudit(input) is the single public entry point.
 * It enriches input data, runs all rule modules, deduplicates,
 * scores priorities, computes the financial summary, and returns AuditResult.
 *
 * Zero AI — all logic is deterministic and hardcoded.
 */

import { PRICING_CATALOG } from "@/lib/pricing";
import type { NormalizedPlan } from "@/lib/pricing/types";
import type { SupportedTool } from "@/types";

import { calcSummary, planMonthlyCost } from "@/lib/audit-engine/calculator";
import { applyPriorities, sortRecommendations } from "@/lib/audit-engine/priority";
import { detectOverspend } from "@/lib/audit-engine/rules/overspend";
import { detectDowngrades } from "@/lib/audit-engine/rules/downgrade";
import { detectRedundant } from "@/lib/audit-engine/rules/redundant";
import { detectApiSwitch } from "@/lib/audit-engine/rules/api-switch";
import { detectAlternatives } from "@/lib/audit-engine/rules/alternative";
import { detectUnusedTier } from "@/lib/audit-engine/rules/unused-tier";

import type {
  AuditInput,
  AuditResult,
  Recommendation,
} from "@/lib/audit-engine/types";

// ─── Internal enriched row type ───────────────────────────────────────────────

type EnrichedTool = {
  tool: SupportedTool;
  plan: NormalizedPlan;
  monthlySpend: number;
  seats: number;
  label: string;
  planLabel: string;
};

// ─── Enrichment ───────────────────────────────────────────────────────────────

/**
 * Resolves each form input row into a fully enriched tool record.
 * Falls back to the first plan if the selected planId is not found.
 */
function enrichInput(input: AuditInput): EnrichedTool[] {
  return input.tools.map((row) => {
    const toolEntry = PRICING_CATALOG.tools[row.tool];
    const plan =
      toolEntry.plans.find((p) => p.id === row.plan) ?? toolEntry.plans[0];
    const seats = row.seats ?? 1;

    return {
      tool: row.tool,
      plan,
      monthlySpend: row.monthlySpend,
      seats,
      label: toolEntry.label,
      planLabel: plan.label,
    };
  });
}

// ─── Deduplication ────────────────────────────────────────────────────────────

/**
 * Deduplicates recommendations: if multiple rules fire for the same
 * (toolId, type) pair, only the one with the highest monthlySaving is kept.
 */
function deduplicateRecs(
  recs: Omit<Recommendation, "priority">[],
): Omit<Recommendation, "priority">[] {
  const map = new Map<string, Omit<Recommendation, "priority">>();

  for (const rec of recs) {
    const key = `${rec.type}:${rec.toolId}`;
    const existing = map.get(key);
    if (!existing || rec.monthlySaving > existing.monthlySaving) {
      map.set(key, rec);
    }
  }

  return Array.from(map.values());
}

// ─── Main engine ─────────────────────────────────────────────────────────────

/**
 * Runs the full deterministic audit.
 *
 * @param input - Validated audit form values.
 * @returns AuditResult with sorted recommendations and financial summary.
 */
export function runAudit(input: AuditInput): AuditResult {
  const enriched = enrichInput(input);

  // Compute per-tool list costs for summary
  const resolvedListCosts = enriched.map((row) =>
    planMonthlyCost(row.plan, row.seats),
  );

  // Run all rule modules
  const rawRecs: Omit<Recommendation, "priority">[] = [
    ...detectOverspend(input, enriched),
    ...detectDowngrades(input, enriched),
    ...detectUnusedTier(input, enriched),
    ...detectRedundant(input, enriched),
    // Track which pairs redundancy already covered so alternative rule can skip them
    ...((): Omit<Recommendation, "priority">[] => {
      const redundantPairs = new Set<string>();
      detectRedundant(input, enriched).forEach((r) => {
        if (r.conflictingToolId) {
          redundantPairs.add([r.toolId, r.conflictingToolId].sort().join("|"));
        }
      });
      return detectAlternatives(input, enriched, redundantPairs);
    })(),
    ...detectApiSwitch(input, enriched),
  ];

  // Deduplicate, apply priorities, sort
  const deduplicated = deduplicateRecs(rawRecs);
  const withPriorities = applyPriorities(deduplicated);
  const sorted = sortRecommendations(withPriorities);

  // Financial summary
  const summary = calcSummary(input, resolvedListCosts, sorted);

  return {
    input,
    summary,
    recommendations: sorted,
    scoredAt: new Date().toISOString(),
  };
}
