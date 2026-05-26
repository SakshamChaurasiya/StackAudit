import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine";

/**
 * Tests for the alternative-tool recommendation rule.
 *
 * The only hardcoded alternative pair: Cursor Pro → Windsurf Pro (≤5 seats).
 * The rule is tested via the full engine so we cover the integration path.
 */
describe("alternative tool rule (via engine)", () => {
  it("fires Cursor Pro → Windsurf Pro for 1 seat", () => {
    const result = runAudit({
      teamSize: 3,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 20, useCase: "engineering" },
      ],
    });
    const altRec = result.recommendations.find(
      (r) => r.type === "alternative" && r.toolId === "cursor"
    );
    expect(altRec).toBeDefined();
    expect(altRec?.alternativeToolId).toBe("windsurf");
    expect(altRec?.monthlySaving).toBeGreaterThan(0);
  });

  it("fires for teams at the max seat threshold (5 seats)", () => {
    const result = runAudit({
      teamSize: 5,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 100, seats: 5, useCase: "engineering" },
      ],
    });
    const altRec = result.recommendations.find(
      (r) => r.type === "alternative" && r.toolId === "cursor"
    );
    expect(altRec).toBeDefined();
  });

  it("does NOT fire for teams above the seat threshold (6 seats)", () => {
    const result = runAudit({
      teamSize: 10,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 120, seats: 6, useCase: "engineering" },
      ],
    });
    const altRec = result.recommendations.find(
      (r) => r.type === "alternative" && r.toolId === "cursor"
    );
    expect(altRec).toBeUndefined();
  });

  it("does NOT fire if Windsurf is already in the stack", () => {
    const result = runAudit({
      teamSize: 3,
      tools: [
        { tool: "cursor", plan: "pro", monthlySpend: 20, useCase: "engineering" },
        { tool: "windsurf", plan: "pro", monthlySpend: 15, useCase: "engineering" },
      ],
    });
    const altRec = result.recommendations.find(
      (r) => r.type === "alternative" && r.toolId === "cursor"
    );
    // Should not fire — windsurf is already in stack (redundant rule fires instead)
    expect(altRec).toBeUndefined();
  });

  it("does NOT fire for Cursor Business plan (only Pro is in the rule table)", () => {
    const result = runAudit({
      teamSize: 3,
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 40, seats: 2, useCase: "engineering" },
      ],
    });
    const altRec = result.recommendations.find(
      (r) => r.type === "alternative" && r.toolId === "cursor"
    );
    expect(altRec).toBeUndefined();
  });
});

/**
 * Tests for the unused-tier / seat floor waste rule.
 *
 * ChatGPT Team: minSeats=2, Claude Team: minSeats=5
 */
describe("unused-tier rule (via engine)", () => {
  it("fires for ChatGPT Team with 1 seat (below minSeats=2)", () => {
    const result = runAudit({
      teamSize: 1,
      tools: [
        { tool: "chatgpt", plan: "team", monthlySpend: 30, seats: 1, useCase: "mixed" },
      ],
    });
    const tierRec = result.recommendations.find(
      (r) => r.type === "unused-tier" && r.toolId === "chatgpt"
    );
    expect(tierRec).toBeDefined();
    expect(tierRec?.monthlySaving).toBeGreaterThan(0);
    expect(tierRec?.priority).toBe(1); // unused-tier is always P1
  });

  it("does NOT fire for ChatGPT Team with 2 seats (meets minSeats=2)", () => {
    const result = runAudit({
      teamSize: 3,
      tools: [
        { tool: "chatgpt", plan: "team", monthlySpend: 50, seats: 2, useCase: "mixed" },
      ],
    });
    const tierRec = result.recommendations.find(
      (r) => r.type === "unused-tier" && r.toolId === "chatgpt"
    );
    expect(tierRec).toBeUndefined();
  });

  it("fires for Claude Team with 3 seats (below minSeats=5)", () => {
    const result = runAudit({
      teamSize: 3,
      tools: [
        { tool: "claude", plan: "team", monthlySpend: 90, seats: 3, useCase: "mixed" },
      ],
    });
    const tierRec = result.recommendations.find(
      (r) => r.type === "unused-tier" && r.toolId === "claude"
    );
    expect(tierRec).toBeDefined();
    expect(tierRec?.monthlySaving).toBeGreaterThan(0);
  });

  it("does NOT fire for Claude Team with 5 seats (meets minSeats=5)", () => {
    const result = runAudit({
      teamSize: 5,
      tools: [
        { tool: "claude", plan: "team", monthlySpend: 150, seats: 5, useCase: "mixed" },
      ],
    });
    const tierRec = result.recommendations.find(
      (r) => r.type === "unused-tier" && r.toolId === "claude"
    );
    expect(tierRec).toBeUndefined();
  });
});
