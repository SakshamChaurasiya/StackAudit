import { describe, it, expect } from "vitest";
import {
  scoreRecommendationPriority,
  sortRecommendations,
  applyPriorities,
} from "@/lib/audit-engine/priority";
import type { Recommendation } from "@/lib/audit-engine/types";

const makeRec = (
  overrides: Partial<Recommendation> = {}
): Recommendation => ({
  id: "test-rec",
  type: "downgrade",
  toolId: "chatgpt",
  title: "Test recommendation",
  reasoning: "Test reasoning",
  priority: 3,
  monthlySaving: 10,
  annualSaving: 120,
  ...overrides,
});

describe("scoreRecommendationPriority", () => {
  it("returns P1 for redundant type regardless of saving amount", () => {
    expect(scoreRecommendationPriority("redundant", 1)).toBe(1);
    expect(scoreRecommendationPriority("redundant", 0)).toBe(1);
  });

  it("returns P1 for unused-tier type regardless of saving amount", () => {
    expect(scoreRecommendationPriority("unused-tier", 5)).toBe(1);
  });

  it("returns P1 for savings >= $50/mo", () => {
    expect(scoreRecommendationPriority("downgrade", 50)).toBe(1);
    expect(scoreRecommendationPriority("downgrade", 200)).toBe(1);
  });

  it("returns P2 for savings >= $20 and < $50", () => {
    expect(scoreRecommendationPriority("downgrade", 20)).toBe(2);
    expect(scoreRecommendationPriority("downgrade", 49)).toBe(2);
  });

  it("returns P3 for savings < $20 on non-elevated types", () => {
    expect(scoreRecommendationPriority("downgrade", 19)).toBe(3);
    expect(scoreRecommendationPriority("alternative", 5)).toBe(3);
    expect(scoreRecommendationPriority("overspend", 0)).toBe(3);
  });

  it("returns P1 for alternative type at $50+ saving", () => {
    expect(scoreRecommendationPriority("alternative", 50)).toBe(1);
  });
});

describe("sortRecommendations", () => {
  it("sorts P1 before P2 before P3", () => {
    const recs = [
      makeRec({ priority: 3, monthlySaving: 100, id: "c" }),
      makeRec({ priority: 1, monthlySaving: 50, id: "a" }),
      makeRec({ priority: 2, monthlySaving: 30, id: "b" }),
    ];
    const sorted = sortRecommendations(recs);
    expect(sorted.map((r) => r.priority)).toEqual([1, 2, 3]);
  });

  it("sorts by saving descending within the same priority", () => {
    const recs = [
      makeRec({ priority: 1, monthlySaving: 30, id: "low" }),
      makeRec({ priority: 1, monthlySaving: 100, id: "high" }),
      makeRec({ priority: 1, monthlySaving: 60, id: "mid" }),
    ];
    const sorted = sortRecommendations(recs);
    expect(sorted.map((r) => r.monthlySaving)).toEqual([100, 60, 30]);
  });

  it("does not mutate the original array", () => {
    const recs = [
      makeRec({ priority: 2, id: "b" }),
      makeRec({ priority: 1, id: "a" }),
    ];
    const copy = [...recs];
    sortRecommendations(recs);
    expect(recs[0].id).toBe(copy[0].id);
  });
});

describe("applyPriorities", () => {
  it("assigns correct priority to each recommendation", () => {
    const input = [
      makeRec({ type: "redundant", monthlySaving: 5 }),
      makeRec({ type: "downgrade", monthlySaving: 60 }),
      makeRec({ type: "alternative", monthlySaving: 15 }),
    ];
    const result = applyPriorities(input);
    expect(result[0].priority).toBe(1); // redundant → P1
    expect(result[1].priority).toBe(1); // $60 saving → P1
    expect(result[2].priority).toBe(3); // $15 alternative → P3
  });

  it("returns a new array (immutable)", () => {
    const input = [makeRec()];
    const result = applyPriorities(input);
    expect(result).not.toBe(input);
  });
});
