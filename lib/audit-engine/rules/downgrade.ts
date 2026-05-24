/**
 * Rule: Downgrade to a cheaper plan.
 *
 * Compares the user's current plan against lower-cost tiers of the same tool.
 * Only suggests downgrades where the cheaper plan is genuinely sufficient
 * for the reported team size and seat count.
 *
 * Hardcoded logic per tool — no AI inference.
 */

import { estimateMonthlyListCost } from "@/lib/pricing/models";
import { PRICING_CATALOG } from "@/lib/pricing";
import type { NormalizedPlan } from "@/lib/pricing/types";
import type { AuditInput, Recommendation } from "@/lib/audit-engine/types";
import type { SupportedTool } from "@/types";

type EnrichedTool = {
  tool: SupportedTool;
  plan: NormalizedPlan;
  monthlySpend: number;
  seats: number;
  label: string;
  planLabel: string;
};

/**
 * Per-tool downgrade rules.
 * Each entry defines: current planId → target planId, and the max seat count
 * at which the cheaper plan is still the better call.
 */
const DOWNGRADE_RULES: {
  toolId: SupportedTool;
  fromPlanId: string;
  toPlanId: string;
  /** Downgrade only fires when seats ≤ this value. */
  maxSeatsForDowngrade: number;
  reason: string;
}[] = [
  // Cursor Business ($40/seat) → Pro ($20 flat) for very small teams
  {
    toolId: "cursor",
    fromPlanId: "business",
    toPlanId: "pro",
    maxSeatsForDowngrade: 3,
    reason:
      "Cursor Business adds admin controls and SSO — rarely needed for teams of 3 or fewer. " +
      "Cursor Pro ($20/mo flat) provides the same AI completions for solo devs and micro-teams.",
  },
  // GitHub Copilot Enterprise ($39/seat) → Business ($19/seat)
  {
    toolId: "github-copilot",
    fromPlanId: "enterprise",
    toPlanId: "business",
    maxSeatsForDowngrade: 25,
    reason:
      "GitHub Copilot Enterprise adds Copilot in GitHub.com and knowledge bases — " +
      "features most engineering teams don't actively use. " +
      "The Business plan ($19/seat) covers full IDE and CLI completions.",
  },
  // ChatGPT Enterprise ($60/seat indicative) → Team ($25/seat)
  {
    toolId: "chatgpt",
    fromPlanId: "enterprise",
    toPlanId: "team",
    maxSeatsForDowngrade: 10,
    reason:
      "ChatGPT Enterprise pricing is custom but indicatively $60+/seat. " +
      "For teams of 10 or fewer, the Team plan ($25/seat, min 2) provides " +
      "GPT-4 access, longer context, and no data training — without enterprise contract overhead.",
  },
  // Claude Team ($25/seat) → Pro ($20 flat) for 1-person use
  {
    toolId: "claude",
    fromPlanId: "team",
    toPlanId: "pro",
    maxSeatsForDowngrade: 1,
    reason:
      "Claude Team requires a minimum of 5 seats. If you're a solo user, " +
      "Claude Pro ($20/mo flat) offers the same model access without seat minimums.",
  },
  // Windsurf Teams ($30/seat) → Pro ($15 flat) for small teams
  {
    toolId: "windsurf",
    fromPlanId: "teams",
    toPlanId: "pro",
    maxSeatsForDowngrade: 2,
    reason:
      "Windsurf Teams adds shared usage and admin controls. " +
      "For 1–2 developers, Windsurf Pro ($15/mo flat) provides identical AI " +
      "completions without seat-based billing.",
  },
  // v0 Team ($30/seat) → Premium ($20 flat) for 1-person
  {
    toolId: "v0",
    fromPlanId: "team",
    toPlanId: "premium",
    maxSeatsForDowngrade: 1,
    reason:
      "v0 Team is designed for collaborative UI generation. " +
      "Solo users get identical generation quota on v0 Premium ($20/mo flat).",
  },
];

/**
 * Returns downgrade recommendations for applicable tool rows.
 */
export function detectDowngrades(
  input: AuditInput,
  enriched: EnrichedTool[],
): Omit<Recommendation, "priority">[] {
  const recs: Omit<Recommendation, "priority">[] = [];

  for (const row of enriched) {
    const { tool, plan, seats, label } = row;

    const rule = DOWNGRADE_RULES.find(
      (r) => r.toolId === tool && r.fromPlanId === plan.id,
    );
    if (!rule) continue;
    if (seats > rule.maxSeatsForDowngrade) continue;

    // Resolve target plan from catalog
    const toolEntry = PRICING_CATALOG.tools[tool];
    const targetPlan = toolEntry.plans.find((p) => p.id === rule.toPlanId);
    if (!targetPlan) continue;

    const currentCost = estimateMonthlyListCost(plan, seats) ?? 0;
    const targetCost = estimateMonthlyListCost(targetPlan, seats) ?? 0;

    const saving = Math.round((currentCost - targetCost) * 100) / 100;
    if (saving <= 0) continue;

    recs.push({
      id: `downgrade-${tool}-${plan.id}-to-${rule.toPlanId}`,
      type: "downgrade",
      toolId: tool,
      targetPlanId: rule.toPlanId,
      title: `Downgrade ${label} from ${plan.label} to ${targetPlan.label} — save $${saving}/mo`,
      reasoning:
        `You're on ${label} ${plan.label} with ${seats} seat${seats !== 1 ? "s" : ""}, ` +
        `costing ~$${currentCost}/mo. ${rule.reason} ` +
        `Moving to ${targetPlan.label} would cost ~$${targetCost}/mo, saving $${saving}/mo ($${saving * 12}/yr).`,
      monthlySaving: saving,
      annualSaving: Math.round(saving * 12),
    });
  }

  return recs;
}
