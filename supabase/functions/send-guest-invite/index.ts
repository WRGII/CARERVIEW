import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendEmail } from "../_shared/emailService.ts";
import { buildGuestInviteEmail } from "../_shared/emailTemplates.ts";
import { json, preflight } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") ?? "https://carerview.com";

const ALLOWED_FORM_TYPES = new Set(["ADL", "IADL", "COMPREHENSIVE"]);

function extractToken(rawLink: unknown): string | null {
  if (typeof rawLink !== "string" || rawLink.length === 0) return null;
  try {
    return new URL(rawLink).searchParams.get("t");
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
    const guestEmail = typeof body?.guest_email === "string" ? body.guest_email.trim() : "";
    const guestName = typeof body?.guest_name === "string" ? body.guest_name.trim().slice(0, 80) : "";
    const formType = typeof body?.form_type === "string" ? body.form_type : "";
    const token = typeof body?.token === "string" && body.token.length > 0
      ? body.token
      : extractToken(body?.guest_link);

    if (!guestEmail || !token || !ALLOWED_FORM_TYPES.has(formType)) {
      return json({ error: "Missing or invalid guest invite details" }, 400, req);
    }

    // The invite must exist, belong to this caller and be addressed to this recipient.
    // The resident name and the sender name come from the record, never from the body.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: verification, error: verifyErr } = await admin.rpc(
      "cv_verify_guest_token_for_sender",
      { p_token: token, p_email: guestEmail, p_sender: user.id },
    );
    if (verifyErr) {
      console.error("send-guest-invite verification error:", verifyErr.message);
      return json({ error: `Verification failed: ${verifyErr.message}`, sent: false }, 500, req);
    }
    if (!verification?.valid) {
      return json({ error: "Guest invite not found for this recipient", sent: false }, 403, req);
    }

    const residentName: string = verification.resident_name;
    const inviterName: string = verification.inviter_name;
    // Built server-side so the email can only ever point at CarerView.
    const guestLink = `${PUBLIC_SITE_URL.replace(/\/$/, "")}/guest-observation?t=${encodeURIComponent(token)}`;

    const html = buildGuestInviteEmail({
      guestName,
      inviterName,
      residentName,
      formType,
      guestLink,
    });

    const result = await sendEmail({
      to: guestEmail,
      subject: `You've been invited to complete a guest observation for ${residentName}`,
      html,
      edgeFunction: "send-guest-invite",
      templateName: "guest_invite",
    });

    return json(
      { sent: result.sent, guest_link: guestLink, messageId: result.messageId ?? null, error: result.error ?? null },
      200,
      req,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-guest-invite error:", message);
    return json({ error: message, sent: false }, 500, req);
  }
});
