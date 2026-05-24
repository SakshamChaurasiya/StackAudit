import { describe, it, expect } from "vitest";
import { detectOverspend } from "@/lib/audit-engine/rules/overspend";
import { PRICING_CATALOG } from "@/lib/pricing";
import type { AuditInput } from "@/lib/audit-engine/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEnriched(
  tool: "cursor" | "claude" | "chatgpt" | "anthropic-api",
  planId: string,
  monthlySpend: number,
  seats = 1,
) {
  const toolEntry = PRICING_CATALOG.tools[tool];
  const plan = toolEntry.plans.find((p) => p.id === planId)!;
  return {
    tool,
    plan,
    monthlySpend,
    seats,
    label: toolEntry.label,
    planLabel: plan.label,
  };
}

function makeInput(tool: "cursor" | "claude" | "chatgpt" | "anthropic-api", monthlySpend: number, seats = 1): AuditInput {
  return {
    teamSize: 5,
    tools: [{ tool, plan: "pro", monthlySpend, seats, useCase: "engineering" }],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("detectOverspend", () => {
  it("fires when reported spend is > list × 1.15", () => {
    // Cursor Pro list = $20/mo. 20 * 1.15 = 23. Report $30 → fires.
    const input = makeInput("cursor", 30);
    const enriched = [makeEnriched("cursor", "pro", 30)];
    const recs = detectOverspend(input, enriched);
    expect(recs).toHaveLength(1);
    expect(recs[0].type).toBe("overspend");
    expect(recs[0].toolId).toBe("cursor");
  });

  it("does NOT fire when reported spend is at list price", () => {
    const input = makeInput("cursor", 20);
    const enriched = [makeEnriched("cursor", "pro", 20)];
    const recs = detectOverspend(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire when reported spend is just within 15% threshold", () => {
    // 20 * 1.15 = 23. Report exactly $23 → should NOT fire (≤ threshold).
    const input = makeInput("cursor", 23);
    const enriched = [makeEnriched("cursor", "pro", 23)];
    const recs = detectOverspend(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("calculates saving correctly (reported − list)", () => {
    // Cursor Pro $20 list. Report $40. Saving = $20.
    const input = makeInput("cursor", 40);
    const enriched = [makeEnriched("cursor", "pro", 40)];
    const recs = detectOverspend(input, enriched);
    expect(recs[0].monthlySaving).toBe(20);
    expect(recs[0].annualSaving).toBe(240);
  });

  it("does NOT fire for usage-based plans with $0 list anchor", () => {
    // Anthropic API pay-as-you-go: listPrice.amountUsd = 0 → skip.
    const toolEntry = PRICING_CATALOG.tools["anthropic-api"];
    const plan = toolEntry.plans.find((p) => p.id === "pay-as-you-go")!;
    const enriched = [
      {
        tool: "anthropic-api" as const,
        plan,
        monthlySpend: 500,
        seats: 1,
        label: toolEntry.label,
        planLabel: plan.label,
      },
    ];
    const input: AuditInput = {
      teamSize: 1,
      tools: [{ tool: "anthropic-api", plan: "pay-as-you-go", monthlySpend: 500, useCase: "engineering" }],
    };
    const recs = detectOverspend(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("does NOT fire for free plans (null listPrice)", () => {
    const toolEntry = PRICING_CATALOG.tools["cursor"];
    const plan = toolEntry.plans.find((p) => p.id === "free")!;
    const enriched = [
      {
        tool: "cursor" as const,
        plan,
        monthlySpend: 999,
        seats: 1,
        label: toolEntry.label,
        planLabel: plan.label,
      },
    ];
    const input: AuditInput = {
      teamSize: 1,
      tools: [{ tool: "cursor", plan: "free", monthlySpend: 999, useCase: "engineering" }],
    };
    const recs = detectOverspend(input, enriched);
    expect(recs).toHaveLength(0);
  });

  it("includes tool label in recommendation title", () => {
    const input = makeInput("cursor", 50);
    const enriched = [makeEnriched("cursor", "pro", 50)];
    const recs = detectOverspend(input, enriched);
    expect(recs[0].title).toContain("Cursor");
  });

  it("recommendation id is stable and contains tool name", () => {
    const input = makeInput("cursor", 50);
    const enriched = [makeEnriched("cursor", "pro", 50)];
    const recs = detectOverspend(input, enriched);
    expect(recs[0].id).toBe("overspend-cursor");
  });
});
