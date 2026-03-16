import { getAdminToken } from "../hooks/useAdminSession";

export async function callAdminDeleteUser(email: string) {
  const clean = email.trim().toLowerCase();
  if (!clean) throw new Error("Email is required");

  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated as admin");

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

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Delete failed");
  return data as { ok: boolean; deleted: boolean; reason?: string };
}
