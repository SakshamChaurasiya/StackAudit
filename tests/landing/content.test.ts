import { describe, expect, it } from "vitest";

import { faq, features, hero } from "@/data/landing-content";

describe("landing-content", () => {
  it("defines hero copy with CTAs", () => {
    expect(hero.headline).toBeTruthy();
    expect(hero.primaryCtaHref).toBe("/audit");
  });

  it("includes six features", () => {
    expect(features).toHaveLength(6);
  });

  it("includes FAQ entries", () => {
    expect(faq.length).toBeGreaterThanOrEqual(5);
  });
});
