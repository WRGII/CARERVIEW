import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUBLIC_SITE_URL =
  Deno.env.get("PUBLIC_SITE_URL") || "https://carerview.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
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
    const authHeader = req.headers.get("Authorization") ?? "";

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: "Not authenticated" }, 401);
    }

    const { email, invite_link, team_name, inviter_name } = await req.json();

    if (!email || !invite_link) {
      return jsonResponse({ error: "Missing email or invite_link" }, 400);
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: existingUsers } =
      await adminClient.auth.admin.listUsers({ perPage: 1 });
    let userExists = false;
    if (existingUsers?.users) {
      const match = existingUsers.users.find(
        (u: { email?: string }) =>
          u.email?.toLowerCase() === email.toLowerCase()
      );
      userExists = !!match;
    }

    if (!userExists) {
      const lookup = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users?filter=email%3Aeq%3A${encodeURIComponent(email)}&page=1&per_page=1`,
        {
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: SUPABASE_SERVICE_ROLE_KEY,
          },
        }
      );
      if (lookup.ok) {
        const body = await lookup.json();
        const users = body?.users ?? body;
        userExists = Array.isArray(users) && users.length > 0;
      }
    }

    const senderName = inviter_name || "A CarerView team member";
    const teamLabel = team_name || "a care team";

    if (!userExists) {
      const redirectTo = invite_link;

      const { data: inviteData, error: inviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo,
          data: {
            display_name: "",
            cv_join_token_url: invite_link,
            invited_by: senderName,
            team_name: teamLabel,
          },
        });

      if (inviteErr) {
        console.error("inviteUserByEmail error:", inviteErr);
        return jsonResponse({
          sent: false,
          method: "invite_failed",
          error: inviteErr.message,
        });
      }

      return jsonResponse({ sent: true, method: "supabase_invite", new_user: true });
    }

    const { data: linkData, error: linkErr } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: invite_link,
        },
      });

    if (linkErr) {
      console.error("generateLink error:", linkErr);
      return jsonResponse({
        sent: false,
        method: "magic_link_failed",
        error: linkErr.message,
      });
    }

    const magicLinkUrl =
      linkData?.properties?.action_link || linkData?.properties?.hashed_token;

    if (magicLinkUrl) {
      const emailHtml = buildEmailHtml(
        senderName,
        teamLabel,
        invite_link,
        PUBLIC_SITE_URL
      );

      const mailRes = await fetch(`${SUPABASE_URL}/auth/v1/magiclink`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          create_user: false,
          gotrue_meta_security: {},
        }),
      });

      if (!mailRes.ok) {
        console.error("magiclink send error:", await mailRes.text());
      }
    }

    return jsonResponse({ sent: true, method: "magic_link", new_user: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-invite-email error:", message);
    return jsonResponse({ error: message }, 500);
  }
});

function buildEmailHtml(
  senderName: string,
  teamLabel: string,
  inviteLink: string,
  siteUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="background-color:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2d3748;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#e6faf9,#f0faf7);padding:36px 40px 28px;border-bottom:1px solid #e2e8f0;">
      <div style="font-size:26px;font-weight:800;color:#1a202c;">CARERVIEW</div>
      <div style="font-size:12px;color:#4a5568;margin-top:5px;">Better Family and In-Home Caregiving through Clear Observations</div>
    </div>
    <div style="padding:36px 40px;">
      <h1 style="font-size:20px;font-weight:700;color:#1a202c;margin:0 0 12px;">You've been invited to join ${teamLabel}</h1>
      <p style="font-size:15px;color:#4a5568;line-height:1.7;margin:0 0 16px;">
        <strong>${senderName}</strong> has invited you to collaborate on CarerView.
      </p>
      <p style="font-size:15px;color:#4a5568;line-height:1.7;margin:0 0 16px;">
        Click below to sign in and join the care team.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${inviteLink}" style="display:inline-block;background:#00bcd4;color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;">Accept Invitation</a>
      </div>
      <p style="font-size:13px;color:#718096;word-break:break-all;">
        Or copy this link: <a href="${inviteLink}" style="color:#00bcd4;text-decoration:none;">${inviteLink}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
      <div style="background:#fffbeb;border-radius:10px;padding:20px;border-left:3px solid #d69e2e;">
        <p style="font-size:14px;color:#744210;margin:0;">This invitation expires in 7 days.</p>
      </div>
    </div>
    <div style="background:#f7fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="font-size:12px;color:#a0aec0;margin:0;">
        &copy; CarerView &middot; <a href="${siteUrl}" style="color:#718096;text-decoration:none;">carerview.com</a>
        &middot; <a href="${siteUrl}/privacy-policy" style="color:#718096;text-decoration:none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
