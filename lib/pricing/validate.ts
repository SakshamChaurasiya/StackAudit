import { SUPPORTED_TOOLS } from "@/lib/pricing/constants";
import { buildPricingCatalog } from "@/lib/pricing/data";
import { PRICING_SOURCES } from "@/lib/pricing/sources";
import type { NormalizedPlan, NormalizedTool, PricingCatalog } from "@/lib/pricing/types";
import type { SupportedTool } from "@/types";

export type PricingValidationIssue = {
  code: string;
  message: string;
  toolId?: SupportedTool;
  planId?: string;
  sourceId?: string;
};

export type PricingValidationResult = {
  valid: boolean;
  issues: PricingValidationIssue[];
};

export function isSupportedTool(toolId: string): toolId is SupportedTool {
  return (SUPPORTED_TOOLS as readonly string[]).includes(toolId);
}

export function isValidPlanForTool(
  catalog: PricingCatalog,
  toolId: SupportedTool,
  planId: string,
): boolean {
  return catalog.tools[toolId]?.plans.some((p) => p.id === planId) ?? false;
}

function validatePlan(
  tool: NormalizedTool,
  plan: NormalizedPlan,
): PricingValidationIssue[] {
  const issues: PricingValidationIssue[] = [];

  if (!PRICING_SOURCES[plan.sourceId]) {
    issues.push({
      code: "MISSING_SOURCE",
      message: `Plan "${plan.id}" references unknown sourceId "${plan.sourceId}"`,
      toolId: tool.id,
      planId: plan.id,
      sourceId: plan.sourceId,
    });
  }

  if (plan.listPrice) {
    if (plan.listPrice.amountUsd < 0) {
      issues.push({
        code: "NEGATIVE_PRICE",
        message: `Plan "${plan.id}" has negative list price`,
        toolId: tool.id,
        planId: plan.id,
      });
    }
    if (plan.listPrice.perSeat && plan.billingModel === "flat" && plan.listPrice.amountUsd > 0) {
      issues.push({
        code: "BILLING_MODEL_MISMATCH",
        message: `Plan "${plan.id}" is flat billing but price is per-seat`,
        toolId: tool.id,
        planId: plan.id,
      });
    }
  }

  return issues;
}

function validateTool(tool: NormalizedTool): PricingValidationIssue[] {
  const issues: PricingValidationIssue[] = [];

  if (tool.plans.length === 0) {
    issues.push({
      code: "NO_PLANS",
      message: `Tool "${tool.id}" has no plans`,
      toolId: tool.id,
    });
  }

  const planIds = new Set<string>();
  for (const plan of tool.plans) {
    if (planIds.has(plan.id)) {
      issues.push({
        code: "DUPLICATE_PLAN_ID",
        message: `Duplicate plan id "${plan.id}"`,
        toolId: tool.id,
        planId: plan.id,
      });
    }
    planIds.add(plan.id);
    issues.push(...validatePlan(tool, plan));
  }

  return issues;
}

/** Validates full catalog integrity — run in tests and CI. */
export function validatePricingCatalog(
  catalog: PricingCatalog = buildPricingCatalog(),
): PricingValidationResult {
  const issues: PricingValidationIssue[] = [];

  for (const expected of SUPPORTED_TOOLS) {
    if (!catalog.tools[expected]) {
      issues.push({
        code: "MISSING_TOOL",
        message: `Supported tool "${expected}" missing from catalog`,
        toolId: expected,
      });
    }
  }

  for (const tool of Object.values(catalog.tools)) {
    issues.push(...validateTool(tool));
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function assertValidPricingCatalog(
  catalog: PricingCatalog = buildPricingCatalog(),
): void {
  const result = validatePricingCatalog(catalog);
  if (!result.valid) {
    const summary = result.issues
      .map((i) => `- [${i.code}] ${i.message}`)
      .join("\n");
    throw new Error(`Invalid pricing catalog:\n${summary}`);
  }
}
