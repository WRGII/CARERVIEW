import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { logEmail } from "./emailLogger.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  edgeFunction: string;
  templateName: string;
}

export interface SendEmailResult {
  sent: boolean;
  messageId?: string;
  error?: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "CarerView <noreply@carerview.com>";
const EMAIL_REPLY_TO = Deno.env.get("EMAIL_REPLY_TO") || "support@carerview.com";

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    await logEmail({
      recipientHash: await hashEmail(params.to),
      templateName: params.templateName,
      subject: params.subject,
      status: "failed",
      errorMessage: "RESEND_API_KEY not configured",
      edgeFunction: params.edgeFunction,
    });
    return { sent: false, error: "Email service not configured" };
  }

  const body = {
    from: EMAIL_FROM,
    to: [params.to],
    reply_to: params.replyTo ?? EMAIL_REPLY_TO,
    subject: params.subject,
    html: params.html,
    tags: params.tags,
    headers: {
      "List-Unsubscribe": `<mailto:${EMAIL_REPLY_TO}?subject=Unsubscribe>`,
    },
  };

  const result = await attemptSend(body);

  await logEmail({
    recipientHash: await hashEmail(params.to),
    templateName: params.templateName,
    subject: params.subject,
    status: result.sent ? "sent" : "failed",
    resendMessageId: result.messageId,
    errorMessage: result.error,
    edgeFunction: params.edgeFunction,
  });

  return result;
}

async function attemptSend(
  body: Record<string, unknown>,
  retries = 1
): Promise<SendEmailResult> {
  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return { sent: true, messageId: data?.id };
    }

    const errorBody = await res.text();

    if (retries > 0 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 1000));
      return attemptSend(body, retries - 1);
    }

    console.error("Resend API error:", res.status, errorBody);
    return { sent: false, error: `Resend ${res.status}: ${errorBody}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return attemptSend(body, retries - 1);
    }
    return { sent: false, error: msg };
  }
}

async function hashEmail(email: string): Promise<string> {
  const encoded = new TextEncoder().encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
