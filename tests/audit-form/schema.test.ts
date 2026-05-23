import { describe, expect, it } from "vitest";

import {
  auditFormDraftSchema,
  auditFormSchema,
  createEmptyToolRow,
} from "@/lib/audit-form/schema";

describe("auditFormSchema", () => {
  const validRow = {
    ...createEmptyToolRow("cursor"),
    monthlySpend: 40,
    seats: 5,
  };

  it("accepts a valid form", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 10,
      tools: [validRow],
    });
    expect(result.success).toBe(true);
  });

  it("requires at least one tool", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [],
    });
    expect(result.success).toBe(false);
  });

  it("requires seats for seat-based plans", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [
        {
          ...createEmptyToolRow("github-copilot"),
          plan: "business",
          monthlySpend: 100,
          seats: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("allows missing seats for usage-based tools", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [
        {
          tool: "openai-api",
          plan: "pay-as-you-go",
          monthlySpend: 250,
          useCase: "engineering",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero monthly spend on submit", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [{ ...validRow, monthlySpend: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate tools", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [validRow, { ...validRow, monthlySpend: 20 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths.some((p) => p.includes("tool"))).toBe(true);
    }
  });

  it("rejects invalid plan for tool", () => {
    const result = auditFormSchema.safeParse({
      teamSize: 5,
      tools: [{ ...validRow, plan: "not-a-real-plan" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("auditFormDraftSchema", () => {
  it("allows zero monthly spend for localStorage hydration", () => {
    const result = auditFormDraftSchema.safeParse({
      teamSize: 8,
      tools: [createEmptyToolRow("cursor")],
    });
    expect(result.success).toBe(true);
  });
});
