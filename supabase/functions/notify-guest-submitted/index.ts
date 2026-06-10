import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildGuestObservationSubmittedEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return preflight(req, "GET, POST, PUT, DELETE, OPTIONS");

  try {
    const { token, guest_name, guest_email, observation_date } = await req.json();
    if (!token) return json({ error: "Missing token" }, 400, req);

    const srv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    const { data: guestToken, error: tokenErr } = await srv
      .from("cv_guest_tokens")
      .select("team_id, resident_name, form_type, consumed_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenErr || !guestToken) return json({ error: "Token not found" }, 404, req);
    if (!guestToken.consumed_at) return json({ error: "Observation not yet submitted" }, 400, req);

    const { data: team } = await srv
      .from("cv_team")
      .select("name, owner_user_id")
      .eq("id", guestToken.team_id)
      .maybeSingle();

    if (!team) return json({ error: "Team not found" }, 404, req);

    const { data: ownerProfile } = await srv
      .from("profiles")
      .select("display_name, email")
      .eq("id", team.owner_user_id)
      .maybeSingle();

    if (!ownerProfile?.email) return json({ sent: false, reason: "owner_email_unavailable" }, 200, req);

    const formattedDate = observation_date
      ? new Date(observation_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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

    return json({ sent: result.sent, error: result.error ?? null }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("notify-guest-submitted error:", message);
    return json({ error: "Internal server error", sent: false }, 500, req);
  }
});
