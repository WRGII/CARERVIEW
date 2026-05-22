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

/** Returns the auth user record for a given email, or null if not found. */
async function lookupUserByEmail(
  email: string
): Promise<{ id: string; email: string } | null> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?filter=email%3Aeq%3A${encodeURIComponent(
      email
    )}&page=1&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );
  if (!res.ok) {
    console.warn(
      "lookupUserByEmail failed:",
      res.status,
      await res.text()
    );
    return null;
  }
  const body = await res.json();
  const users: { id: string; email: string }[] = body?.users ?? body ?? [];
  return Array.isArray(users) && users.length > 0 ? users[0] : null;
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

    const senderName = inviter_name || "A CarerView team member";
    const teamLabel = team_name || "a care team";

    // Single, correct user-exists check — no broken listUsers({ perPage: 1 }) call.
    const existingUser = await lookupUserByEmail(email);

    if (!existingUser) {
      // ── New user path ──
      // inviteUserByEmail creates the Supabase auth account and sends the
      // native invite email.  redirectTo points at the /join?t=... URL so the
      // user lands on InviteSetupPage after email verification.
      const { error: inviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo: invite_link,
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

      return jsonResponse({
        sent: true,
        method: "supabase_invite",
        new_user: true,
      });
    }

    // ── Existing user path ──
    // generateLink produces a signed action_link that authenticates the user
    // AND redirects to invite_link in a single click.  We use this link as the
    // button href in the branded email so the full invite flow works correctly.
    // Append ?mode=signin so InviteSetupPage opens on the correct tab by default.
    const inviteLinkForExisting = invite_link.includes("?")
      ? `${invite_link}&mode=signin`
      : `${invite_link}?mode=signin`;

    const { data: linkData, error: linkErr } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: inviteLinkForExisting },
      });

    if (linkErr) {
      console.error("generateLink error:", linkErr);
      return jsonResponse({
        sent: false,
        method: "magic_link_failed",
        error: linkErr.message,
      });
    }

    const actionLink = linkData?.properties?.action_link;

    if (!actionLink) {
      console.error(
        "generateLink returned no action_link:",
        JSON.stringify(linkData)
      );
      return jsonResponse({
        sent: false,
        method: "magic_link_failed",
        error: "No action_link returned from generateLink",
      });
    }

    // Deliver the branded email via GoTrue's per-user send_email endpoint.
    // The button href is actionLink (authenticates + redirects to invite).
    // The plain-text copy link is invite_link (the raw /join?t=... URL).
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
        // Pass the pre-generated hashed token so GoTrue uses our link
        // rather than minting a new one that would differ from actionLink.
        ...(linkData?.properties?.hashed_token
          ? { token: linkData.properties.hashed_token }
          : {}),
      }),
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      console.error("magiclink send failed:", mailRes.status, errText);
      return jsonResponse({
        sent: false,
        method: "magic_link_failed",
        error: errText || `HTTP ${mailRes.status}`,
      });
    }

    return jsonResponse({
      sent: true,
      method: "magic_link",
      new_user: false,
      // Return the action_link so the caller can surface a manual fallback
      // link if needed (e.g. in TeamSettings copy-link display).
      action_link: actionLink,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-invite-email error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});

function buildEmailHtml(
  _senderName: string,
  _teamLabel: string,
  _actionLink: string,
  _copyLink: string,
  _siteUrl: string
): string {
  // Retained for reference — GoTrue sends its own email for magic links.
  // This would be used if switching to a custom SMTP provider (e.g. Resend).
  return "";
}
