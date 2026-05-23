/**
 * Form-facing catalog API — backed by normalized pricing data.
 * @see lib/pricing/index.ts for full pricing layer
 */

import { PRICING_CATALOG } from "@/lib/pricing/index";
import { planRequiresSeatsInput } from "@/lib/pricing/models";
import type {
  PlanOption,
  ToolCatalogEntry,
} from "@/lib/pricing/types";
import type { SupportedTool } from "@/types";

/** @deprecated Use PRICING_CATALOG — kept for backward compatibility */
export const TOOL_CATALOG: Record<SupportedTool, ToolCatalogEntry> =
  Object.fromEntries(
    Object.entries(PRICING_CATALOG.tools).map(([id, tool]) => [
      id,
      {
        id: tool.id,
        label: tool.label,
        billingType: tool.defaultBillingModel,
        plans: tool.plans.map(
          (p): PlanOption => ({ id: p.id, label: p.label }),
        ),
      },
    ]),
  ) as Record<SupportedTool, ToolCatalogEntry>;

export type { BillingModel } from "@/lib/pricing/types";
export type { PlanOption, ToolCatalogEntry };

export const TOOL_OPTIONS = Object.values(PRICING_CATALOG.tools).map((t) => ({
  value: t.id,
  label: t.label,
}));

export function getToolEntry(tool: SupportedTool) {
  return TOOL_CATALOG[tool];
}

export function getNormalizedTool(tool: SupportedTool) {
  return PRICING_CATALOG.tools[tool];
}

export function getPlansForTool(tool: SupportedTool): PlanOption[] {
  return TOOL_CATALOG[tool].plans;
}

export function toolRequiresSeats(tool: SupportedTool): boolean {
  return PRICING_CATALOG.tools[tool].metadata.requiresSeats;
}

export function toolRequiresSeatsForPlan(
  tool: SupportedTool,
  planId: string,
): boolean {
  return planRequiresSeatsInput(PRICING_CATALOG.tools[tool], planId);
}

export function getDefaultPlanForTool(tool: SupportedTool): string {
  return PRICING_CATALOG.tools[tool].plans[0]?.id ?? "";
}

export function isValidPlanForTool(tool: SupportedTool, planId: string): boolean {
  return PRICING_CATALOG.tools[tool].plans.some((p) => p.id === planId);
}

export function findUnusedTool(used: SupportedTool[]): SupportedTool | null {
  const all = Object.keys(PRICING_CATALOG.tools) as SupportedTool[];
  return all.find((t) => !used.includes(t)) ?? null;
}
