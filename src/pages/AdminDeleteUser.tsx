import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { callAdminDeleteUser } from "../lib/admin";
import { useLocale } from "../i18n/LocaleContext";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function AdminDeleteUser() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<{ email: string | null; role?: string } | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setMe({
        email: u?.email ?? null,
        role: (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role,
      });
    });
  }, []);

  const canSee = !!me && me.role === "admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOut(null);
    setLoading(true);
    try {
      const res = await callAdminDeleteUser(email.trim().toLowerCase());
      setOut(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setOut(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!me) return <div className="p-6">{t('admin.checking_session')}</div>;
  if (!canSee) return <div className="p-6">{t('admin.admins_only')}</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('admin.delete_user_title')}</h1>
      <form onSubmit={onSubmit} className="flex gap-2 mb-4">
        <input
          type="email"
          required
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button disabled={loading} className="px-4 py-2 border rounded">
          {loading ? t('common.deleting') : t('common.delete')}
        </button>
      </form>
      <pre className="bg-neutral-100 rounded p-3 text-sm overflow-auto min-h-[120px]">
        {out ?? t('admin.result_placeholder')}
      </pre>
      <p className="text-xs opacity-70 mt-2">
        {t('admin.signed_in_as')} {me.email} ({me.role ?? "no-role"})
      </p>
    </div>
  );
}
