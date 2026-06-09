import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildMemberJoinedEmail } from "../_shared/emailTemplates.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

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
    // Verify the caller is the new member (authenticated)
    const authHeader = req.headers.get("Authorization") ?? "";
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const { team_id } = await req.json();
    if (!team_id) {
      return jsonResponse({ error: "Missing team_id" }, 400);
    }

    const srv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Look up team + owner profile
    const { data: team, error: teamErr } = await srv
      .from("cv_team")
      .select("name, owner_user_id")
      .eq("id", team_id)
      .maybeSingle();

    if (teamErr || !team) {
      return jsonResponse({ error: "Team not found" }, 404);
    }

    const { data: ownerProfile } = await srv
      .from("profiles")
      .select("display_name, email")
      .eq("id", team.owner_user_id)
      .maybeSingle();

    if (!ownerProfile?.email) {
      // Owner email unavailable — nothing to notify
      return jsonResponse({ sent: false, reason: "owner_email_unavailable" });
    }

    // Look up new member's profile
    const { data: memberProfile } = await srv
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .maybeSingle();

    const newMemberName = memberProfile?.display_name || user.email || "A new member";
    const newMemberEmail = memberProfile?.email || user.email || "";

    const html = buildMemberJoinedEmail({
      ownerName: ownerProfile.display_name || "",
      newMemberName,
      newMemberEmail,
      teamName: team.name,
      dashboardLink: `${PUBLIC_SITE_URL}/caregiver`,
    });

    const result = await sendEmail({
      to: ownerProfile.email,
      subject: `${newMemberName} has joined your care team on CarerView`,
      html,
      edgeFunction: "notify-member-joined",
      templateName: "member_joined",
    });

    return jsonResponse({ sent: result.sent, error: result.error ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("notify-member-joined error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
