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

/** Returns the auth user record for a given email, or null if not found. */
async function lookupUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users?filter=email%3Aeq%3A${encodeURIComponent(email)}&page=1&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );
  if (!res.ok) {
    console.warn("lookupUserByEmail failed:", res.status, await res.text());
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

    // Check whether the guest email already has a Supabase auth account
    const existingUser = await lookupUserByEmail(guest_email);

    if (!existingUser) {
      // New user — inviteUserByEmail creates the account and dispatches
      // Supabase's native invite email. redirectTo carries the guest token URL
      // so the guest lands directly on the observation form.
      const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
        guest_email,
        {
          redirectTo: guest_link,
          data: {
            guest_name: guest_name || null,
            invited_by: inviterName,
            resident_name,
            form_type,
          },
        }
      );

      if (inviteErr) {
        console.error("inviteUserByEmail error:", inviteErr);
        return jsonResponse({
          sent: false,
          method: "invite_failed",
          guest_link,
          error: inviteErr.message,
        });
      }

      return jsonResponse({
        sent: true,
        method: "supabase_invite",
        guest_link,
      });
    }

    // Existing user — use generateLink (magiclink) which works for confirmed accounts
    // and redirects them to the guest observation form after clicking the link.
    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: guest_email,
      options: { redirectTo: guest_link },
    });

    if (linkErr) {
      console.error("generateLink error:", linkErr);
      return jsonResponse({
        sent: false,
        method: "magiclink_failed",
        guest_link,
        error: linkErr.message,
      });
    }

    return jsonResponse({
      sent: true,
      method: "magiclink",
      guest_link,
      action_link: linkData?.properties?.action_link ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-guest-invite error:", message);
    return jsonResponse({ error: message, sent: false }, 500);
  }
});
