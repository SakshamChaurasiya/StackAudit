/**
 * Public email API for StackAudit.
 *
 * Usage:
 *   import { sendLeadEmails, isResendConfigured } from "@/lib/email";
 *
 * Sends two emails in parallel when a lead is captured:
 * 1. Confirmation to the submitter
 * 2. Internal notification to the site owner (LEAD_NOTIFICATION_EMAIL)
 *
 * Both emails are non-fatal — failures are logged but never throw.
 * If Resend is not configured, this function is a no-op.
 */

export { isResendConfigured } from "@/lib/email/resend";

import type { AuditSummary } from "@/lib/audit-engine/types";
import { sendEmail } from "@/lib/email/resend";
import { buildConfirmationEmail } from "@/lib/email/templates/confirmation";
import { buildNotificationEmail } from "@/lib/email/templates/notification";

export type LeadEmailPayload = {
  email: string;
  name?: string;
  auditId: string;
};

/**
 * Sends both the confirmation and internal notification emails for a new lead.
 *
 * - Fires both sends in parallel via Promise.allSettled (independent failures)
 * - Non-fatal: logs any failures but never throws
 * - No-op if RESEND_API_KEY or RESEND_FROM_EMAIL are not configured
 */
export async function sendLeadEmails(
  lead: LeadEmailPayload,
  summary: AuditSummary
): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL;

  if (!fromEmail) {
    console.warn("[Email] RESEND_FROM_EMAIL not set. Skipping email send.");
    return;
  }

  const confirmation = buildConfirmationEmail(lead, summary);
  const notification = notifyEmail
    ? buildNotificationEmail(lead, summary)
    : null;

  const sends: Promise<{ success: boolean; error?: string }>[] = [
    sendEmail({
      to: lead.email,
      from: fromEmail,
      subject: confirmation.subject,
      html: confirmation.html,
    }),
  ];

  if (notification && notifyEmail) {
    sends.push(
      sendEmail({
        to: notifyEmail,
        from: fromEmail,
        subject: notification.subject,
        html: notification.html,
      })
    );
  }

  const results = await Promise.allSettled(sends);

  results.forEach((result, idx) => {
    const label = idx === 0 ? "confirmation" : "notification";
    if (result.status === "rejected") {
      console.error(`[Email] ${label} email promise rejected:`, result.reason);
    } else if (!result.value.success) {
      console.warn(`[Email] ${label} email send failed:`, result.value.error);
    } else {
      console.log(`[Email] ${label} email sent to ${idx === 0 ? lead.email : notifyEmail}`);
    }
  });
}
