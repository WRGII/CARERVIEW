import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildWelcomeEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401, req);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const srv = createClient(supabaseUrl, serviceRoleKey);

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user?.email) return json({ error: "Unauthorized" }, 401, req);

  const email = user.email;
  const recipientHash = await hashEmail(email);

  const { data: existing } = await srv
    .from("email_audit_log")
    .select("id")
    .eq("recipient_hash", recipientHash)
    .eq("template_name", "welcome")
    .eq("status", "sent")
    .maybeSingle();

  if (existing) return json({ sent: false, reason: "already_sent" }, 200, req);

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

  return json(result, 200, req);
});

async function hashEmail(email: string): Promise<string> {
  const encoded = new TextEncoder().encode(email.toLowerCase().trim());
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
