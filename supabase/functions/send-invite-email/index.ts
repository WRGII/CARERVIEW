import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildTeamInviteEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") ?? "https://carerview.com";

function extractToken(rawLink: unknown): string | null {
  if (typeof rawLink !== "string" || rawLink.length === 0) return null;
  try {
    const url = new URL(rawLink);
    return url.searchParams.get("t");
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req, "GET, POST, PUT, DELETE, OPTIONS");

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) return json({ error: "Not authenticated" }, 401, req);

    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const token = typeof body?.token === "string" && body.token.length > 0
      ? body.token
      : extractToken(body?.invite_link);

    if (!email || !token) return json({ error: "Missing email or invite token" }, 400, req);

    // The recipient, the team name and the sender name are all decided server-side from
    // the invite record: the caller only names the token it just created. This stops the
    // function being used to mail a branded CarerView invite to an arbitrary address.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: verification, error: verifyErr } = await admin.rpc(
      "cv_verify_invite_for_sender",
      { p_token: token, p_email: email, p_sender: user.id },
    );
    if (verifyErr) {
      console.error("send-invite-email verification error:", verifyErr.message);
      return json({ error: "Internal server error", sent: false }, 500, req);
    }
    if (!verification?.valid) {
      return json({ error: "Invite not found for this recipient", sent: false }, 403, req);
    }

    const teamLabel: string = verification.team_name;
    const inviterName: string = verification.inviter_name;
    // Built here, never taken from the request: a caller cannot point the button at
    // a site they control.
    const inviteLink = `${PUBLIC_SITE_URL.replace(/\/$/, "")}/join?t=${encodeURIComponent(token)}`;

    const html = buildTeamInviteEmail({ inviterName, teamName: teamLabel, inviteLink });

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
