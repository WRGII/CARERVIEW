import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildTeamInviteEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req, "GET, POST, PUT, DELETE, OPTIONS");

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401, req);

    const { email, invite_link, team_name, inviter_name } = await req.json();
    if (!email || !invite_link) return json({ error: "Missing email or invite_link" }, 400, req);

    const inviterName = inviter_name || "A CarerView team member";
    const teamLabel = team_name || "a care team";

    const html = buildTeamInviteEmail({ inviterName, teamName: teamLabel, inviteLink: invite_link });

    const result = await sendEmail({
      to: email,
      subject: `You've been invited to join ${teamLabel} on CarerView`,
      html,
      edgeFunction: "send-invite-email",
      templateName: "team_invite",
    });

    if (!result.sent) return json({ sent: false, error: result.error }, 200, req);
    return json({ sent: true, messageId: result.messageId }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-invite-email error:", message);
    return json({ error: "Internal server error", sent: false }, 500, req);
  }
});
