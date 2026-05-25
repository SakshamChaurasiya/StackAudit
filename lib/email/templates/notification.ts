import type { AuditSummary } from "@/lib/audit-engine/types";

export type LeadInfo = {
  email: string;
  name?: string;
  auditId: string;
};

/**
 * Builds the internal lead notification email sent to the site owner.
 * Compact format with all relevant lead and audit data at a glance.
 */
export function buildNotificationEmail(
  lead: LeadInfo,
  summary: AuditSummary
): { subject: string; html: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stackaudit.app";
  const resultsUrl = `${appUrl}/results/${lead.auditId}`;
  const now = new Date().toLocaleString("en-US", {
    timeZone: "UTC",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New StackAudit Lead</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#1f2937;padding:20px 32px;">
          <p style="margin:0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;">StackAudit</p>
          <p style="margin:4px 0 0;font-size:18px;color:#ffffff;font-weight:700;">🎯 New Lead Captured</p>
        </td></tr>

        <!-- Lead Details -->
        <tr><td style="padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Email</span><br>
                <span style="font-size:15px;color:#111827;font-weight:500;">${lead.email}</span>
              </td>
            </tr>
            ${lead.name ? `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Name</span><br>
                <span style="font-size:15px;color:#111827;font-weight:500;">${lead.name}</span>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;">Submitted</span><br>
                <span style="font-size:14px;color:#374151;">${now} UTC</span>
              </td>
            </tr>
          </table>

          <!-- Audit Stats -->
          <p style="font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;margin:24px 0 12px;">Audit Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
                <span style="font-size:12px;color:#6b7280;">Monthly Spend</span><br>
                <span style="font-size:16px;color:#111827;font-weight:600;">$${summary.totalMonthlySpend.toFixed(0)}</span>
              </td>
              <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;border-left:1px solid #e5e7eb;">
                <span style="font-size:12px;color:#6b7280;">Annual Savings Found</span><br>
                <span style="font-size:16px;color:#7c3aed;font-weight:600;">$${summary.totalAnnualSaving.toFixed(0)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 16px;">
                <span style="font-size:12px;color:#6b7280;">Tools Audited</span><br>
                <span style="font-size:16px;color:#111827;font-weight:600;">${summary.toolCount}</span>
              </td>
              <td style="padding:12px 16px;border-left:1px solid #e5e7eb;">
                <span style="font-size:12px;color:#6b7280;">Recommendations</span><br>
                <span style="font-size:16px;color:#111827;font-weight:600;">${summary.recommendationCount}</span>
              </td>
            </tr>
          </table>

          <!-- Audit Link -->
          <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="background:#7c3aed;border-radius:6px;padding:10px 20px;">
              <a href="${resultsUrl}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                View Audit Report &rarr;
              </a>
            </td></tr>
          </table>

          <p style="font-size:12px;color:#9ca3af;margin:20px 0 0;">
            Audit ID: <code style="font-family:monospace;">${lead.auditId}</code>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return {
    subject: `[StackAudit] New lead: ${lead.email} — $${summary.totalAnnualSaving.toFixed(0)} savings found`,
    html,
  };
}
