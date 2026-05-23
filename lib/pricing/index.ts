import { buildPricingCatalog } from "@/lib/pricing/data";

/** Singleton catalog — built once at module load. */
export const PRICING_CATALOG = buildPricingCatalog();

export {
  PRICING_CATALOG_UPDATED_AT,
  PRICING_CATALOG_VERSION,
  SUPPORTED_TOOLS,
} from "@/lib/pricing/constants";

export { buildPricingCatalog, PRICING_TOOLS } from "@/lib/pricing/data";

export {
  annualizeMonthly,
  estimateMonthlyListCost,
  formatPrice,
  isFreePlan,
  isSeatBasedPlan,
  isUsageBasedPlan,
  planRequiresSeatsInput,
} from "@/lib/pricing/models";

export {
  getPriceSource,
  listPriceSources,
  PRICING_SOURCES,
} from "@/lib/pricing/sources";

export type {
  BillingModel,
  NormalizedPlan,
  NormalizedPrice,
  NormalizedTool,
  PlanOption,
  PricePeriod,
  PriceSource,
  PricingCatalog,
  ToolCatalogEntry,
  ToolCategory,
  ToolMetadata,
} from "@/lib/pricing/types";

export {
  assertValidPricingCatalog,
  isSupportedTool,
  isValidPlanForTool,
  validatePricingCatalog,
  type PricingValidationIssue,
  type PricingValidationResult,
} from "@/lib/pricing/validate";
