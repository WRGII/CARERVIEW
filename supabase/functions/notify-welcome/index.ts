// Sends a welcome email to a user after their first confirmed sign-in.
// Call this from the frontend once on first authenticated session.
// The function is idempotent: it checks the email_audit_log and skips
// if a welcome email was already sent for this recipient hash.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildWelcomeEmail } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const srv = createClient(supabaseUrl, serviceRoleKey);

  // Verify the caller is a valid authenticated user.
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = user.email;
  const recipientHash = await hashEmail(email);

  // Idempotency: skip if a welcome email was already logged for this address.
  const { data: existing } = await srv
    .from("email_audit_log")
    .select("id")
    .eq("recipient_hash", recipientHash)
    .eq("template_name", "welcome")
    .eq("status", "sent")
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ sent: false, reason: "already_sent" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Look up display name from profiles.
  const { data: profile } = await srv
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name || "";
  const dashboardLink = `${SITE_URL}/caregiver`;

  const html = buildWelcomeEmail({ displayName, dashboardLink });
  const result = await sendEmail({
    to: email,
    subject: "Welcome to CarerView — you're all set",
    html,
    edgeFunction: "notify-welcome",
    templateName: "welcome",
    tags: [{ name: "type", value: "welcome" }],
  });

  return new Response(JSON.stringify(result), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

async function hashEmail(email: string): Promise<string> {
  const encoded = new TextEncoder().encode(email.toLowerCase().trim());
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
