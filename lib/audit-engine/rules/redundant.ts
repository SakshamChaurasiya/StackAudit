/**
 * Rule: Redundant tool detection.
 *
 * Uses the `overlapsWith` metadata from the pricing catalog to identify
 * tools in the user's stack that serve materially the same purpose.
 *
 * Overlap categories and their firing logic:
 * - IDE tools  (Cursor / Copilot / Windsurf) — strongly overlapping; fire if both paid.
 * - Assistant  (Claude / ChatGPT / Gemini)   — weakly overlapping; fire if combined > $40/mo.
 * - API tools  (Anthropic API / OpenAI API)  — acceptable diversity; fire only if both > $200/mo
 *                                               on the same use case.
 */

import { PRICING_CATALOG } from "@/lib/pricing";
import type { NormalizedPlan, ToolCategory } from "@/lib/pricing/types";
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

/** Monthly spend above which a tool is considered "paid" for redundancy purposes. */
const PAID_THRESHOLD = 0;

/** Combined assistant spend threshold to fire redundancy. */
const ASSISTANT_COMBINED_THRESHOLD = 40;

/** Per-tool API spend threshold to fire redundancy (same use case). */
const API_SPEND_THRESHOLD = 200;

function isPaid(row: EnrichedTool): boolean {
  return row.monthlySpend > PAID_THRESHOLD && row.plan.id !== "free";
}

function getCategory(toolId: SupportedTool): ToolCategory {
  return PRICING_CATALOG.tools[toolId].metadata.category;
}

/**
 * Returns the cheaper of two tool rows (lower monthlySpend).
 * If equal, returns the second (arbitrary but deterministic).
 */
function cheaperOf(a: EnrichedTool, b: EnrichedTool): EnrichedTool {
  return a.monthlySpend <= b.monthlySpend ? a : b;
}

/**
 * Returns redundancy recommendations for overlapping paid tools.
 * Deduplicates so each pair only generates one recommendation.
 */
export function detectRedundant(
  input: AuditInput,
  enriched: EnrichedTool[],
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];
  const firedPairs = new Set<string>();

  for (let i = 0; i < enriched.length; i++) {
    const rowA = enriched[i];
    const overlaps =
      PRICING_CATALOG.tools[rowA.tool].metadata.overlapsWith ?? [];

    for (let j = i + 1; j < enriched.length; j++) {
      const rowB = enriched[j];
      if (!overlaps.includes(rowB.tool)) continue;

      const pairKey = [rowA.tool, rowB.tool].sort().join("|");
      if (firedPairs.has(pairKey)) continue;

      const categoryA = getCategory(rowA.tool);
      const categoryB = getCategory(rowB.tool);

      // IDE overlap — fire if both are paid
      if (categoryA === "ide" && categoryB === "ide") {
        if (!isPaid(rowA) || !isPaid(rowB)) continue;

        const toRemove = cheaperOf(rowA, rowB);
        const toKeep = toRemove === rowA ? rowB : rowA;
        const saving = toRemove.monthlySpend;

        firedPairs.add(pairKey);
        recs.push({
          id: `redundant-${pairKey}`,
          type: "redundant",
          toolId: toRemove.tool,
          conflictingToolId: toKeep.tool,
          title: `${toRemove.label} and ${toKeep.label} are redundant IDE tools`,
          reasoning:
            `${rowA.label} and ${rowB.label} both provide AI-powered code completions ` +
            `inside the IDE — they serve the same core workflow. ` +
            `You're spending $${rowA.monthlySpend}/mo on ${rowA.label} and ` +
            `$${rowB.monthlySpend}/mo on ${rowB.label}. ` +
            `Consolidating to ${toKeep.label} alone eliminates $${saving}/mo ($${saving * 12}/yr) in redundant spend.`,
          monthlySaving: Math.round(saving * 100) / 100,
          annualSaving: Math.round(saving * 12 * 100) / 100,
        });
        continue;
      }

      // Assistant overlap — fire if combined spend > $40/mo
      if (categoryA === "assistant" && categoryB === "assistant") {
        if (!isPaid(rowA) || !isPaid(rowB)) continue;
        const combined = rowA.monthlySpend + rowB.monthlySpend;
        if (combined <= ASSISTANT_COMBINED_THRESHOLD) continue;

        const toRemove = cheaperOf(rowA, rowB);
        const toKeep = toRemove === rowA ? rowB : rowA;
        const saving = toRemove.monthlySpend;

        firedPairs.add(pairKey);
        recs.push({
          id: `redundant-${pairKey}`,
          type: "redundant",
          toolId: toRemove.tool,
          conflictingToolId: toKeep.tool,
          title: `${rowA.label} and ${rowB.label} overlap as AI assistants`,
          reasoning:
            `${rowA.label} and ${rowB.label} both serve general AI assistant use cases. ` +
            `Together you're spending $${combined}/mo. ` +
            `Most teams standardise on one assistant to avoid context fragmentation. ` +
            `Dropping ${toRemove.label} saves $${saving}/mo ($${saving * 12}/yr) — ` +
            `${toKeep.label} covers the same workflows.`,
          monthlySaving: Math.round(saving * 100) / 100,
          annualSaving: Math.round(saving * 12 * 100) / 100,
        });
        continue;
      }

      // API overlap — fire only if both > $200/mo AND same use case
      if (categoryA === "api" && categoryB === "api") {
        if (rowA.monthlySpend < API_SPEND_THRESHOLD) continue;
        if (rowB.monthlySpend < API_SPEND_THRESHOLD) continue;

        // Resolve use cases from the input rows
        const inputA = input.tools.find((t) => t.tool === rowA.tool);
        const inputB = input.tools.find((t) => t.tool === rowB.tool);
        if (inputA?.useCase !== inputB?.useCase) continue;

        const toRemove = cheaperOf(rowA, rowB);
        const toKeep = toRemove === rowA ? rowB : rowA;
        const saving = toRemove.monthlySpend;

        firedPairs.add(pairKey);
        recs.push({
          id: `redundant-${pairKey}`,
          type: "redundant",
          toolId: toRemove.tool,
          conflictingToolId: toKeep.tool,
          title: `High dual-API spend: ${rowA.label} + ${rowB.label} on same use case`,
          reasoning:
            `You're spending $${rowA.monthlySpend}/mo on ${rowA.label} and ` +
            `$${rowB.monthlySpend}/mo on ${rowB.label}, both for ${inputA?.useCase ?? "the same"} workflows. ` +
            `At this spend level it's worth evaluating whether one API satisfies your model requirements. ` +
            `Consolidating to ${toKeep.label} could save $${saving}/mo ($${saving * 12}/yr).`,
          monthlySaving: Math.round(saving * 100) / 100,
          annualSaving: Math.round(saving * 12 * 100) / 100,
        });
      }
    }
  }

  return recs;
}
