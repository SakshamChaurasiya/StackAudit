import { describe, expect, it } from "vitest";

import { PRICING_CATALOG } from "@/lib/pricing";
import {
  assertValidPricingCatalog,
  isSupportedTool,
  isValidPlanForTool,
  validatePricingCatalog,
} from "@/lib/pricing/validate";

describe("validatePricingCatalog", () => {
  it("validates the production catalog", () => {
    const result = validatePricingCatalog(PRICING_CATALOG);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("assertValidPricingCatalog does not throw", () => {
    expect(() => assertValidPricingCatalog(PRICING_CATALOG)).not.toThrow();
  });
});

describe("pricing validators", () => {
  it("isSupportedTool accepts known slugs", () => {
    expect(isSupportedTool("cursor")).toBe(true);
    expect(isSupportedTool("unknown")).toBe(false);
  });

  it("isValidPlanForTool checks plan ids", () => {
    expect(isValidPlanForTool(PRICING_CATALOG, "chatgpt", "team")).toBe(true);
    expect(isValidPlanForTool(PRICING_CATALOG, "chatgpt", "invalid")).toBe(
      false,
    );
  });
});
