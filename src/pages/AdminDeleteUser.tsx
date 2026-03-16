import React, { useState } from "react";
import { callAdminDeleteUser } from "../lib/admin";
import { useLocale } from "../i18n/LocaleContext";

export default function AdminDeleteUser() {
  const [email, setEmail] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOut(null);
    setLoading(true);
    try {
      const res = await callAdminDeleteUser(email.trim().toLowerCase());
      setOut(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      setOut(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("admin.delete_user_title")}</h1>
      <form onSubmit={onSubmit} className="flex gap-2 mb-4">
        <label htmlFor="delete-user-email" className="sr-only">
          {t("auth.email_label")}
        </label>
        <input
          id="delete-user-email"
          type="email"
          required
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button disabled={loading} aria-busy={loading} className="px-4 py-2 border rounded">
          {loading ? t("common.deleting") : t("common.delete")}
        </button>
      </form>
      <pre className="bg-neutral-100 rounded p-3 text-sm overflow-auto min-h-[120px]">
        {out ?? t("admin.result_placeholder")}
      </pre>
    </div>
  );
}
