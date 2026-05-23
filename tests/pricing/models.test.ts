import { describe, expect, it } from "vitest";

import { PRICING_CATALOG } from "@/lib/pricing";
import {
  annualizeMonthly,
  estimateMonthlyListCost,
  formatPrice,
  isFreePlan,
  planRequiresSeatsInput,
} from "@/lib/pricing/models";

describe("estimateMonthlyListCost", () => {
  it("computes per-seat team pricing with minimum seats", () => {
    const chatgpt = PRICING_CATALOG.tools.chatgpt;
    const teamPlan = chatgpt.plans.find((p) => p.id === "team")!;
    expect(estimateMonthlyListCost(teamPlan, 2)).toBe(50);
    expect(estimateMonthlyListCost(teamPlan, 1)).toBe(50);
  });

  it("returns null for usage-based plans without list anchor", () => {
    const api = PRICING_CATALOG.tools["openai-api"];
    const plan = api.plans.find((p) => p.id === "pay-as-you-go")!;
    expect(estimateMonthlyListCost(plan)).toBeNull();
  });

  it("returns 0 for free tiers", () => {
    const plan = PRICING_CATALOG.tools.cursor.plans.find((p) => p.id === "free")!;
    expect(isFreePlan(plan)).toBe(true);
    expect(estimateMonthlyListCost(plan)).toBe(0);
  });
});

describe("planRequiresSeatsInput", () => {
  it("requires seats for ChatGPT Team", () => {
    expect(
      planRequiresSeatsInput(PRICING_CATALOG.tools.chatgpt, "team"),
    ).toBe(true);
  });

  it("does not require seats for ChatGPT Plus", () => {
    expect(
      planRequiresSeatsInput(PRICING_CATALOG.tools.chatgpt, "plus"),
    ).toBe(false);
  });
});

describe("formatPrice", () => {
  it("formats per-seat monthly price", () => {
    const plan = PRICING_CATALOG.tools.chatgpt.plans.find((p) => p.id === "team")!;
    expect(formatPrice(plan.listPrice!)).toContain("per seat");
  });
});

describe("annualizeMonthly", () => {
  it("multiplies by 12", () => {
    expect(annualizeMonthly(40)).toBe(480);
  });
});
