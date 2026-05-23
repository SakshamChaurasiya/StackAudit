import { PRICING_CATALOG_UPDATED_AT, PRICING_CATALOG_VERSION } from "@/lib/pricing/constants";
import { PRICING_TOOLS } from "@/lib/pricing/data/tools";
import type { PricingCatalog } from "@/lib/pricing/types";
import type { SupportedTool } from "@/types";

export function buildPricingCatalog(): PricingCatalog {
  const tools = {} as Record<SupportedTool, (typeof PRICING_TOOLS)[number]>;

  for (const tool of PRICING_TOOLS) {
    tools[tool.id] = tool;
  }

  return {
    version: PRICING_CATALOG_VERSION,
    updatedAt: PRICING_CATALOG_UPDATED_AT,
    tools,
  };
}

export { PRICING_TOOLS };
