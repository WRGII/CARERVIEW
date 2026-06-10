import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildGuestObservationSubmittedEmail } from "../_shared/emailTemplates.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
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
    const { token, guest_name, guest_email, observation_date } = await req.json();
    if (!token) {
      return jsonResponse({ error: "Missing token" }, 400);
    }

    const srv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Hash the token to look it up — the raw token is never stored
    const encoder = new TextEncoder();
    const tokenBytes = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Verify token exists and was actually consumed (reject spam calls for unconsumed tokens)
    const { data: guestToken, error: tokenErr } = await srv
      .from("cv_guest_tokens")
      .select("team_id, resident_name, form_type, consumed_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenErr || !guestToken) {
      return jsonResponse({ error: "Token not found" }, 404);
    }

    if (!guestToken.consumed_at) {
      return jsonResponse({ error: "Observation not yet submitted" }, 400);
    }

    // Look up team owner
    const { data: team } = await srv
      .from("cv_team")
      .select("name, owner_user_id")
      .eq("id", guestToken.team_id)
      .maybeSingle();

    if (!team) {
      return jsonResponse({ error: "Team not found" }, 404);
    }

    const { data: ownerProfile } = await srv
      .from("profiles")
      .select("display_name, email")
      .eq("id", team.owner_user_id)
      .maybeSingle();

    if (!ownerProfile?.email) {
      return jsonResponse({ sent: false, reason: "owner_email_unavailable" });
    }

    const formattedDate = observation_date
      ? new Date(observation_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const html = buildGuestObservationSubmittedEmail({
      ownerName: ownerProfile.display_name || "",
      guestName: guest_name || "A guest observer",
      guestEmail: guest_email || "",
      residentName: guestToken.resident_name,
      formType: guestToken.form_type,
      observationDate: formattedDate,
      dashboardLink: `${PUBLIC_SITE_URL}/caregiver`,
    });

    const result = await sendEmail({
      to: ownerProfile.email,
      subject: `New guest observation submitted for ${guestToken.resident_name}`,
      html,
      edgeFunction: "notify-guest-submitted",
      templateName: "guest_observation_submitted",
    });

    return jsonResponse({ sent: result.sent, error: result.error ?? null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("notify-guest-submitted error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
