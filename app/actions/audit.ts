"use server";

import { runAudit } from "@/lib/audit-engine";
import { auditFormSchema } from "@/lib/audit-form/schema";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { insertAudit } from "@/lib/supabase/db";
import type { AuditInput } from "@/lib/audit-engine/types";

export type AuditActionResponse =
  | { success: true; id: string }
  | { success: false; fallback: true }
  | { success: false; error: string };

/**
 * Server action to process and save a stack audit.
 * Runs deterministic calculations server-side and persists to Supabase.
 * Gracefully signals fallback mode if Supabase is unconfigured.
 */
export async function runAndSaveAuditAction(
  rawInput: unknown
): Promise<AuditActionResponse> {
  try {
    // 1. Validate inputs on the server
    const parsed = auditFormSchema.safeParse(rawInput);
    if (!parsed.success) {
      const messages = parsed.error.errors.map((e) => e.message).join(", ");
      return { success: false, error: `Validation failed: ${messages}` };
    }

    const input: AuditInput = parsed.data;

    // 2. Check if Supabase is configured; if not, return fallback signal
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured. Falling back to client storage.");
      return { success: false, fallback: true };
    }

    // 3. Compute audit calculations
    const result = runAudit(input);

    // 4. Save to database
    const id = await insertAudit(input, result);

    return { success: true, id };
  } catch (err) {
    console.error("Failed to run or save audit on server:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    };
  }
}
