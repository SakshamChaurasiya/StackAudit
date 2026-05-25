import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/**
 * Returns true if the Resend API key is configured.
 * Used to determine whether emails should be sent or silently skipped.
 */
export function isResendConfigured(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

export type SendEmailOptions = {
  to: string;
  from: string;
  subject: string;
  html: string;
};

export type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Generic email send wrapper around the Resend SDK.
 * Returns a typed result — never throws.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    console.warn("[Resend] API key not configured. Skipping email send.");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const resend = new Resend(apiKey!);
    const { error } = await resend.emails.send({
      to: options.to,
      from: options.from,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("[Resend] Send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[Resend] Unexpected error:", message);
    return { success: false, error: message };
  }
}
