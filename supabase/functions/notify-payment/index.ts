// Sends subscription and payment notification emails.
// Called internally (fire-and-forget) from stripe-webhook after DB writes complete.
// Never requires user auth — uses service-role validation via a shared secret header.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import {
  buildSubscriptionConfirmedEmail,
  buildPaymentReceiptEmail,
  buildPaymentFailedEmail,
  buildSubscriptionCancelledEmail,
  buildTrialEndingEmail,
} from "../_shared/emailTemplates.ts";

const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "";
const SITE_URL = PUBLIC_SITE_URL || "https://carerview.com";

function getAllowedOrigin(req: Request): string {
  const incoming = req.headers.get("origin") || "";
  if (!PUBLIC_SITE_URL) return incoming || "*";
  if (incoming === PUBLIC_SITE_URL) return incoming;
  const host = incoming.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const siteHost = PUBLIC_SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const bare = siteHost.replace(/^www\./, "");
  if (host === bare || host === `www.${bare}`) return incoming;
  return PUBLIC_SITE_URL;
}

function buildCorsHeaders(req: Request): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getAllowedOrigin(req),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

function json(body: unknown, status: number, req: Request) {
  return new Response(JSON.stringify(body), { status, headers: buildCorsHeaders(req) });
}

async function timingSafeStringEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length !== bBytes.length) {
    await crypto.subtle.timingSafeEqual(aBytes, aBytes);
    return false;
  }
  return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}

type NotifyPaymentBody =
  | { type: "subscription_confirmed"; userId: string; planName: string; periodEnd: string }
  | { type: "payment_receipt"; userId: string; planName: string; amountFormatted: string; invoiceDate: string; invoiceUrl?: string }
  | { type: "payment_failed"; userId: string; planName: string; amountFormatted: string; nextAttemptDate?: string }
  | { type: "subscription_cancelled"; userId: string; planName: string; accessUntil: string }
  | { type: "trial_ending"; userId: string; planName: string; trialEndDate: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: buildCorsHeaders(req) });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  const submittedKey = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!(await timingSafeStringEqual(submittedKey, serviceRoleKey))) {
    return json({ error: "Forbidden" }, 403, req);
  }

  let body: NotifyPaymentBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, req);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const srv = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile } = await srv
    .from("profiles")
    .select("display_name, email")
    .eq("id", body.userId)
    .maybeSingle();

  if (!profile?.email) {
    return json({ sent: false, reason: "no_email" }, 200, req);
  }

  const email = profile.email as string;
  const displayName = (profile.display_name as string) || "";
  const dashboardLink = `${SITE_URL}/caregiver`;
  const billingLink = `${SITE_URL}/caregiver?tab=billing`;
  const upgradeLink = `${SITE_URL}/choose-plan`;

  let subject = "";
  let html = "";
  let templateName = "";

  switch (body.type) {
    case "subscription_confirmed":
      subject = `Your CarerView ${body.planName} subscription is active`;
      html = buildSubscriptionConfirmedEmail({ displayName, planName: body.planName, periodEnd: body.periodEnd, dashboardLink });
      templateName = "subscription_confirmed";
      break;
    case "payment_receipt":
      subject = `CarerView payment receipt — ${body.amountFormatted}`;
      html = buildPaymentReceiptEmail({ displayName, planName: body.planName, amountFormatted: body.amountFormatted, invoiceDate: body.invoiceDate, invoiceUrl: body.invoiceUrl, dashboardLink });
      templateName = "payment_receipt";
      break;
    case "payment_failed":
      subject = `Action required: payment failed for your CarerView subscription`;
      html = buildPaymentFailedEmail({ displayName, planName: body.planName, amountFormatted: body.amountFormatted, nextAttemptDate: body.nextAttemptDate, billingLink });
      templateName = "payment_failed";
      break;
    case "subscription_cancelled":
      subject = `Your CarerView ${body.planName} subscription has been cancelled`;
      html = buildSubscriptionCancelledEmail({ displayName, planName: body.planName, accessUntil: body.accessUntil, dashboardLink });
      templateName = "subscription_cancelled";
      break;
    case "trial_ending":
      subject = `Your CarerView trial ends ${body.trialEndDate}`;
      html = buildTrialEndingEmail({ displayName, planName: body.planName, trialEndDate: body.trialEndDate, upgradeLink });
      templateName = "trial_ending";
      break;
    default:
      return json({ error: "Unknown notification type" }, 400, req);
  }

  const result = await sendEmail({
    to: email,
    subject,
    html,
    edgeFunction: "notify-payment",
    templateName,
    tags: [{ name: "type", value: templateName }],
  });

  return json(result, 200, req);
});
