import type { SupportedTool } from "@/types";

/** How a plan is billed — drives audit rules and form UX. */
export type BillingModel = "seat" | "flat" | "usage";

export type ToolCategory = "ide" | "assistant" | "api" | "design";

export type PricePeriod = "month" | "year";

/** Documented vendor source for a price point. */
export type PriceSource = {
  id: string;
  vendor: string;
  url: string;
  checkedAt: string; // ISO date YYYY-MM-DD
  notes?: string;
};

/**
 * Normalized list price in USD.
 * `perSeat` + `minSeats` apply to team/seat tiers.
 */
export type NormalizedPrice = {
  amountUsd: number;
  period: PricePeriod;
  perSeat: boolean;
  minSeats?: number;
  /** Human-readable qualifier (e.g. "estimated typical startup usage") */
  qualifier?: string;
};

/** Single plan tier with list price and source linkage. */
export type NormalizedPlan = {
  id: string;
  label: string;
  billingModel: BillingModel;
  /** Null = free tier or purely usage-based with no list anchor */
  listPrice: NormalizedPrice | null;
  sourceId: string;
  /** Short note for auditors / UI hints */
  description?: string;
};

export type ToolMetadata = {
  category: ToolCategory;
  /** Tools that commonly overlap in startup stacks */
  overlapsWith?: SupportedTool[];
  /** Seat field required on audit form */
  requiresSeats: boolean;
  website?: string;
};

/** Full tool entry in the pricing catalog. */
export type NormalizedTool = {
  id: SupportedTool;
  label: string;
  slug: SupportedTool;
  defaultBillingModel: BillingModel;
  metadata: ToolMetadata;
  plans: NormalizedPlan[];
};

export type PricingCatalog = {
  version: string;
  updatedAt: string;
  tools: Record<SupportedTool, NormalizedTool>;
};

/** Legacy form-facing plan option (no prices). */
export type PlanOption = {
  id: string;
  label: string;
};

/** Legacy form-facing tool entry. */
export type ToolCatalogEntry = {
  id: SupportedTool;
  label: string;
  billingType: BillingModel;
  plans: PlanOption[];
};
