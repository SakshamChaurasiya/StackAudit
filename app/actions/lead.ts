"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { insertLead, hasRecentLead, selectAudit } from "@/lib/supabase/db";
import { sendLeadEmails } from "@/lib/email";

const leadSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  auditId: z.string().uuid("Invalid audit identifier").optional(),
  name: z.string().max(100, "Name is too long").optional(),
});

export type LeadActionResponse =
  | { success: true; mock?: boolean }
  | { success: false; error: string };

/**
 * Server action to capture lead emails and link them to their audits.
 *
 * Flow:
 * 1. Validate inputs (email, optional auditId + name)
 * 2. Anti-spam: if same email captured within 10 min, return success silently
 * 3. Insert lead into database
 * 4. Fetch audit summary and send confirmation + notification emails (non-fatal)
 *
 * Gracefully simulates success in local dev fallback mode if Supabase is unconfigured.
 */
export async function captureLeadAction(
  email: string,
  auditId?: string,
  name?: string
): Promise<LeadActionResponse> {
  try {
    // 1. Validate inputs
    const parsed = leadSchema.safeParse({ email, auditId, name });
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

    // 3. Anti-spam: check if the same email was submitted within the last 10 minutes
    const isDuplicate = await hasRecentLead(parsed.data.email, 10);
    if (isDuplicate) {
      console.info(`[Lead] Duplicate submission suppressed for ${parsed.data.email}`);
      return { success: true }; // idempotent — silent success, no re-send
    }

    // 4. Insert into database
    await insertLead(parsed.data.email, parsed.data.auditId, parsed.data.name);

    // 5. Send emails (confirmation + notification) — non-fatal
    if (parsed.data.auditId) {
      try {
        const auditResult = await selectAudit(parsed.data.auditId);
        if (auditResult) {
          await sendLeadEmails(
            {
              email: parsed.data.email,
              name: parsed.data.name,
              auditId: parsed.data.auditId,
            },
            auditResult.summary
          );
        }
      } catch (emailErr) {
        // Non-fatal: lead is saved, email failure is acceptable
        console.error("[Lead] Failed to send lead emails:", emailErr);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to capture lead on server:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    };
  }
}

