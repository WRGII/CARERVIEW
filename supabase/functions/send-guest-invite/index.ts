import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildGuestInviteEmail } from "../_shared/emailTemplates.ts";

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

    const { guest_email, guest_name, guest_link, inviter_name, resident_name, form_type } = await req.json();

    if (!guest_email || !guest_link || !resident_name || !form_type) {
      return jsonResponse(
        { error: "Missing required fields: guest_email, guest_link, resident_name, form_type" },
        400
      );
    }

    const html = buildGuestInviteEmail({
      guestName: guest_name || "",
      inviterName: inviter_name || "Your care team",
      residentName: resident_name,
      formType: form_type,
      guestLink: guest_link,
    });

    const result = await sendEmail({
      to: guest_email,
      subject: `You've been invited to complete a guest observation for ${resident_name}`,
      html,
      edgeFunction: "send-guest-invite",
      templateName: "guest_invite",
    });

    return jsonResponse({
      sent: result.sent,
      guest_link,
      messageId: result.messageId ?? null,
      error: result.error ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-guest-invite error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
