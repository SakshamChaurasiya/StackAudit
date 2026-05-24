"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { insertLead } from "@/lib/supabase/db";

const leadSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  auditId: z.string().uuid("Invalid audit identifier").optional(),
});

export type LeadActionResponse =
  | { success: true; mock?: boolean }
  | { success: false; error: string };

/**
 * Server action to capture lead emails and link them to their audits.
 * Gracefully simulates success in local dev fallback mode if Supabase is unconfigured.
 */
export async function captureLeadAction(
  email: string,
  auditId?: string
): Promise<LeadActionResponse> {
  try {
    // 1. Validate inputs
    const parsed = leadSchema.safeParse({ email, auditId });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0].message,
      };
    }

    // 2. Check if Supabase is configured; if not, simulate success (fallback mode)
    if (!isSupabaseConfigured()) {
      console.warn(
        `Supabase unconfigured. Simulating lead capture for email: ${email} (auditId: ${auditId})`
      );
      return { success: true, mock: true };
    }

    // 3. Insert into database
    await insertLead(parsed.data.email, parsed.data.auditId);

    return { success: true };
  } catch (err) {
    console.error("Failed to capture lead on server:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    };
  }
}
