import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildGuestInviteEmail } from "../_shared/emailTemplates.ts";
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

    const { guest_email, guest_name, guest_link, inviter_name, resident_name, form_type } = await req.json();

    if (!guest_email || !guest_link || !resident_name || !form_type) {
      return json({ error: "Missing required fields: guest_email, guest_link, resident_name, form_type" }, 400, req);
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

    return json({ sent: result.sent, guest_link, messageId: result.messageId ?? null, error: result.error ?? null }, 200, req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-guest-invite error:", message);
    return json({ error: "Internal server error", sent: false }, 500, req);
  }
});
