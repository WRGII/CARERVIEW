import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildTeamInviteEmail } from "../_shared/emailTemplates.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const { email, invite_link, team_name, inviter_name } = await req.json();
    if (!email || !invite_link) {
      return jsonResponse({ error: "Missing email or invite_link" }, 400);
    }

    const inviterName = inviter_name || "A CarerView team member";
    const teamLabel = team_name || "a care team";

    const html = buildTeamInviteEmail({
      inviterName,
      teamName: teamLabel,
      inviteLink: invite_link,
    });

    const result = await sendEmail({
      to: email,
      subject: `You've been invited to join ${teamLabel} on CarerView`,
      html,
      edgeFunction: "send-invite-email",
      templateName: "team_invite",
    });

    if (!result.sent) {
      return jsonResponse({ sent: false, error: result.error });
    }

    return jsonResponse({ sent: true, messageId: result.messageId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-invite-email error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
