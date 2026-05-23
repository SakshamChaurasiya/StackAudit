import { z } from "zod";

import { USE_CASES } from "@/lib/audit-form/constants";
import {
  getDefaultPlanForTool,
  getPlansForTool,
  toolRequiresSeatsForPlan,
} from "@/lib/pricing/catalog";
import type { SupportedTool } from "@/types";

const supportedTools = [
  "cursor",
  "github-copilot",
  "claude",
  "chatgpt",
  "anthropic-api",
  "openai-api",
  "gemini",
  "windsurf",
  "v0",
] as const satisfies readonly SupportedTool[];

const toolEnum = z.enum(supportedTools, {
  required_error: "Select a tool",
});

const toolRowBaseSchema = z.object({
  tool: toolEnum,
  plan: z.string().min(1, "Select a plan"),
  monthlySpend: z.coerce
    .number({
      required_error: "Enter monthly spend",
      invalid_type_error: "Enter a valid amount",
    })
    .min(0, "Spend cannot be negative")
    .max(1_000_000, "Enter a realistic monthly amount"),
  seats: z.coerce
    .number({
      invalid_type_error: "Enter a valid seat count",
    })
    .int("Seats must be a whole number")
    .min(0, "Seats cannot be negative")
    .max(10_000, "Enter a realistic seat count")
    .optional(),
  useCase: z.enum(USE_CASES, {
    required_error: "Select a use case",
  }),
});

function refineSeatRules(
  row: z.infer<typeof toolRowBaseSchema>,
  ctx: z.RefinementCtx,
) {
  if (toolRequiresSeatsForPlan(row.tool, row.plan)) {
    if (row.seats === undefined || row.seats < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter at least 1 seat for seat-based tools",
        path: ["seats"],
      });
    }
  }

  const validPlanIds = getPlansForTool(row.tool).map((p) => p.id);
  if (!validPlanIds.includes(row.plan)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a valid plan for this tool",
      path: ["plan"],
    });
  }
}

/** Lenient schema for localStorage hydration (allows $0 spend while editing). */
export const toolRowDraftSchema = toolRowBaseSchema.superRefine(refineSeatRules);

export const auditFormDraftSchema = z.object({
  teamSize: z.coerce
    .number({
      required_error: "Enter team size",
      invalid_type_error: "Enter a valid team size",
    })
    .int("Team size must be a whole number")
    .min(1, "Team size must be at least 1")
    .max(10_000, "Enter a realistic team size"),
  tools: z
    .array(toolRowDraftSchema)
    .min(1, "Add at least one AI tool")
    .max(15, "Maximum 15 tools per audit"),
});

export const toolRowSchema = toolRowBaseSchema
  .superRefine(refineSeatRules)
  .superRefine((row, ctx) => {
    if (row.monthlySpend === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your monthly spend (use 0 only if truly free)",
        path: ["monthlySpend"],
      });
    }
  });

export const auditFormSchema = z
  .object({
    teamSize: auditFormDraftSchema.shape.teamSize,
    tools: z
      .array(toolRowSchema)
      .min(1, "Add at least one AI tool")
      .max(15, "Maximum 15 tools per audit"),
  })
  .superRefine((data, ctx) => {
    const seen = new Map<string, number>();
    data.tools.forEach((row, index) => {
      const firstIndex = seen.get(row.tool);
      if (firstIndex !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "This tool is already in your stack",
          path: ["tools", index, "tool"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Duplicate tool — remove one row",
          path: ["tools", firstIndex, "tool"],
        });
      } else {
        seen.set(row.tool, index);
      }
    });
  });

export function createEmptyToolRow(
  tool: SupportedTool = "cursor",
): z.infer<typeof toolRowSchema> {
  return {
    tool,
    plan: getDefaultPlanForTool(tool),
    monthlySpend: 0,
    seats: toolRequiresSeatsForPlan(tool, getDefaultPlanForTool(tool))
      ? 1
      : undefined,
    useCase: "engineering",
  };
}

export const defaultAuditFormValues: z.infer<typeof auditFormSchema> = {
  teamSize: 5,
  tools: [createEmptyToolRow("cursor")],
};
