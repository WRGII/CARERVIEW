// src/lib/admin.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Calls the Supabase Edge Function `admin-delete-user` to delete an Auth user by email.
 * Requires the caller to be signed in (admin) so we can forward their JWT.
 */
export async function callAdminDeleteUser(email: string) {
  const clean = email.trim().toLowerCase();
  if (!clean) throw new Error("Email is required");

  // Forward the current session's access token
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;
  if (!token) throw new Error("Not signed in");

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-delete-user`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: clean }),
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || "Delete failed");
  return json as { ok: boolean; deleted: boolean; reason?: string };
}
