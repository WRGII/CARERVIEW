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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

type NotifyPaymentBody =
  | { type: "subscription_confirmed"; userId: string; planName: string; periodEnd: string }
  | { type: "payment_receipt"; userId: string; planName: string; amountFormatted: string; invoiceDate: string; invoiceUrl?: string }
  | { type: "payment_failed"; userId: string; planName: string; amountFormatted: string; nextAttemptDate?: string }
  | { type: "subscription_cancelled"; userId: string; planName: string; accessUntil: string }
  | { type: "trial_ending"; userId: string; planName: string; trialEndDate: string };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  // Only accept calls bearing the service role key — this function is internal only.
  const authHeader = req.headers.get("Authorization") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!authHeader.includes(serviceRoleKey)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: NotifyPaymentBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const srv = createClient(supabaseUrl, serviceRoleKey);

  // Look up user email and display name.
  const { data: profile } = await srv
    .from("profiles")
    .select("display_name, email")
    .eq("id", body.userId)
    .maybeSingle();

  if (!profile?.email) {
    return new Response(JSON.stringify({ sent: false, reason: "no_email" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
      return new Response(JSON.stringify({ error: "Unknown notification type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
  }

  const result = await sendEmail({
    to: email,
    subject,
    html,
    edgeFunction: "notify-payment",
    templateName,
    tags: [{ name: "type", value: templateName }],
  });

  return new Response(JSON.stringify(result), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
