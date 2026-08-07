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

  const contentType = body?.contentType === "reply" ? "reply" : "post";
  const contentExcerpt = typeof body?.contentExcerpt === "string" ? body.contentExcerpt.slice(0, 500) : "";
  const reason = typeof body?.reason === "string" ? body.reason.slice(0, 120) : "";
  if (!reason) return json({ error: "Missing reason" }, 400, req);

  // The caller must actually have filed a report just now: without this any signed-in
  // user could mail moderators arbitrary text as often as they liked.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recentReport } = await srv
    .from("community_reports")
    .select("id")
    .eq("reporter_user_id", user.id)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  if (!recentReport) {
    return json({ error: "No matching report", sent: 0 }, 403, req);
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
    contentType,
    contentExcerpt,
    reason,
    moderationLink,
  });
  const subject = `[CarerView] New community report: ${reason}`;

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
