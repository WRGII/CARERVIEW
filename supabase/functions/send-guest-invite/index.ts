import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

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

function buildGuestInviteEmail(opts: {
  guestName: string | null;
  inviterName: string;
  residentName: string;
  formType: string;
  guestLink: string;
  expiresHours: number;
  siteUrl: string;
}): string {
  const { guestName, inviterName, residentName, formType, guestLink, expiresHours, siteUrl } = opts;
  const greeting = guestName ? `Hi ${guestName},` : "Hello,";
  const formLabel =
    formType === "COMPREHENSIVE" ? "ADL + IADL (Comprehensive)"
    : formType === "ADL" ? "ADL (Activities of Daily Living)"
    : "IADL (Instrumental Activities of Daily Living)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guest Observation Invitation — CarerView</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#0e7490;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">CarerView</p>
            <p style="margin:6px 0 0;font-size:13px;color:#a5f3fc;">Compassionate caregiving, organised.</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;color:#1e293b;font-weight:600;">${greeting}</p>
            <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
              <strong style="color:#1e293b;">${inviterName}</strong> has invited you to complete a one-time care observation for
              <strong style="color:#1e293b;">${residentName}</strong> using CarerView.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
              This is a <strong style="color:#1e293b;">${formLabel}</strong> observation. It only takes a few minutes and
              does not require you to create an account.
            </p>
            <!-- CTA Button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background:#0e7490;border-radius:10px;">
                  <a href="${guestLink}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">
                    Complete Observation →
                  </a>
                </td>
              </tr>
            </table>
            <!-- Info box -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:0.5px;">What to expect</p>
                  <ul style="margin:0;padding-left:18px;font-size:14px;color:#134e4a;line-height:1.7;">
                    <li>You will be asked for your name and email</li>
                    <li>Rate activities on a simple 1–5 scale</li>
                    <li>Add any notes you feel are helpful</li>
                    <li>Your responses are saved automatically</li>
                  </ul>
                </td>
              </tr>
            </table>
            <!-- Expiry notice -->
            <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.5;">
              This link is valid for <strong>${expiresHours} hours</strong> and can only be used once. If it has expired, please ask ${inviterName} to send a new invitation.
            </p>
            <!-- Fallback link -->
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              If the button above doesn't work, copy and paste this link into your browser:<br>
              <a href="${guestLink}" style="color:#0e7490;word-break:break-all;">${guestLink}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f1f5f9;background:#f8fafc;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
              You received this email because ${inviterName} sent you a guest observation invitation via CarerView.
              If you did not expect this email, you can safely ignore it.
              <br><a href="${siteUrl}/privacy-policy" style="color:#0e7490;">Privacy Policy</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

    const {
      guest_email,
      guest_name,
      guest_link,
      inviter_name,
      resident_name,
      form_type,
    } = await req.json();

    if (!guest_email || !guest_link || !resident_name || !form_type) {
      return jsonResponse({ error: "Missing required fields: guest_email, guest_link, resident_name, form_type" }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const inviterName = inviter_name || "Your care team";

    const htmlBody = buildGuestInviteEmail({
      guestName: guest_name || null,
      inviterName,
      residentName: resident_name,
      formType: form_type,
      guestLink: guest_link,
      expiresHours: 72,
      siteUrl: PUBLIC_SITE_URL,
    });

    // Send via Supabase Auth admin — generates a magic link pointing at the guest URL
    // This reuses GoTrue's SMTP config without needing a separate email provider
    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: guest_email,
      options: { redirectTo: guest_link },
    });

    if (linkErr) {
      console.error("generateLink error:", linkErr);
      // Fall through — return the link so the primary carer can share it manually
      return jsonResponse({
        sent: false,
        method: "link_only",
        guest_link,
        error: linkErr.message,
      });
    }

    return jsonResponse({
      sent: true,
      method: "magiclink_redirect",
      guest_link,
      action_link: linkData?.properties?.action_link ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-guest-invite error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
