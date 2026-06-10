import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TriangleAlert as AlertTriangle } from "lucide-react";
import { callAdminDeleteUser } from "../lib/admin";
import { useLocale } from "../i18n/LocaleContext";

export default function AdminDeleteUser() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLocale();

  const targetEmail = email.trim().toLowerCase();
  const confirmationMatches = confirmEmail.trim().toLowerCase() === targetEmail && targetEmail.length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationMatches) return;
    setOut(null);
    setLoading(true);
    try {
      const res = await callAdminDeleteUser(targetEmail);
      setOut(JSON.stringify(res, null, 2));
      setEmail("");
      setConfirmEmail("");
    } catch (err: unknown) {
      setOut(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t("admin.return_to_dashboard")}
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">{t("admin.delete_user_title")}</h1>

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <span>This action is <strong>permanent and irreversible</strong>. The user's account, profile, and all associated data will be deleted.</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 mb-4">
        <div>
          <label htmlFor="delete-user-email" className="block text-sm font-medium text-slate-700 mb-1">
            {t("auth.email_label")}
          </label>
          <input
            id="delete-user-email"
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
          />
        </div>

        <div>
          <label htmlFor="confirm-user-email" className="block text-sm font-medium text-slate-700 mb-1">
            Type the email again to confirm
          </label>
          <input
            id="confirm-user-email"
            type="text"
            required
            placeholder="Retype email to confirm"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            autoComplete="off"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
              confirmEmail.length > 0
                ? confirmationMatches
                  ? "border-green-400 focus:ring-green-300 bg-green-50"
                  : "border-red-300 focus:ring-red-300 bg-red-50"
                : "focus:ring-slate-300"
            }`}
          />
          {confirmEmail.length > 0 && !confirmationMatches && (
            <p className="mt-1 text-xs text-red-600">Emails do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !confirmationMatches}
          aria-busy={loading}
          className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? t("common.deleting") : t("common.delete")}
        </button>
      </form>

      <pre className="bg-neutral-100 rounded p-3 text-sm overflow-auto min-h-[120px]">
        {out ?? t("admin.result_placeholder")}
      </pre>
    </div>
  );
}
