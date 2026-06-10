import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildAdminReportAlertEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

interface NotifyAdminReportBody {
  contentType: "post" | "reply";
  contentExcerpt: string;
  reason: string;
}

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
  if (authErr || !user) return json({ error: "Unauthorized" }, 401, req);

  let body: NotifyAdminReportBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400, req);
  }

  const { data: reporterProfile } = await srv
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const reporterDisplayName = reporterProfile?.display_name || "A community member";

  const { data: admins } = await srv
    .from("profiles")
    .select("email")
    .eq("role", "admin")
    .eq("disabled", false);

  if (!admins || admins.length === 0) {
    return json({ sent: false, reason: "no_admins" }, 200, req);
  }

  const moderationLink = `${SITE_URL}/admin/community-moderation`;
  const html = buildAdminReportAlertEmail({
    reporterDisplayName,
    contentType: body.contentType,
    contentExcerpt: body.contentExcerpt,
    reason: body.reason,
    moderationLink,
  });
  const subject = `[CarerView] New community report: ${body.reason}`;

  const results = await Promise.allSettled(
    admins
      .filter((a) => a.email)
      .map((a) =>
        sendEmail({
          to: a.email as string,
          subject,
          html,
          edgeFunction: "notify-admin-report",
          templateName: "admin_report_alert",
          tags: [{ name: "type", value: "admin_report_alert" }],
        })
      )
  );

  const sent = results.filter(
    (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<any>).value.sent
  ).length;

  return json({ sent, total: admins.length }, 200, req);
});
