import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CircleCheck as CheckCircle2, Circle as XCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { useFormatDate } from "../hooks/useFormatDate";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { getAdminToken } from "../hooks/useAdminSession";

async function callAdminData(action: string, payload: Record<string, unknown> = {}) {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated as admin");
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action, payload }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Admin operation failed");
  return data;
}


type CaregiverRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  role: string;
  disabled: boolean;
  created_at: string;
};

export default function ActiveCaregiversPage() {
  const qc = useQueryClient();
  const { t } = useLocale();
  const { formatDateTime } = useFormatDate();

  const caregiversQ = useQuery({
    queryKey: ["admin", "caregivers"],
    queryFn: async (): Promise<CaregiverRow[]> => {
      const result = await callAdminData("list_caregivers");
      return (result as { data: CaregiverRow[] }).data ?? [];
    },
    staleTime: 30_000,
  });

  const addM = useMutation({
    mutationFn: async (payload: { email: string; display_name: string }) => {
      return callAdminData("add_caregiver", { email: payload.email, display_name: payload.display_name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "caregivers"] });
    },
  });

  const toggleM = useMutation({
    mutationFn: async (row: CaregiverRow) => {
      await callAdminData("toggle_caregiver", { id: row.id, disabled: !row.disabled });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "caregivers"] });
    },
  });

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-gray">{t('active_cg.title')}</h1>
            <p className="text-slate-gray/70">
              {t('active_cg.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
              aria-label="Back to Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('admin.title')}
            </Link>

            <button
              type="button"
              onClick={() => caregiversQ.refetch()}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
              disabled={caregiversQ.isRefetching}
              aria-busy={caregiversQ.isRefetching}
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-gray/20 rounded-2xl p-6 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <Plus className="w-5 h-5 text-cyan-primary" />
            </div>
            <h2 className="text-lg font-semibold text-slate-gray">{t('active_cg.add_title')}</h2>
          </div>

          <AddForm
            busy={addM.isPending}
            error={addM.error as Error | null}
            onSubmit={(values) => addM.mutate(values)}
          />

          {addM.isSuccess && (
            <p className="mt-3 text-sm text-mint-green-700">
              {t('active_cg.invite_success')}
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-gray/20 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-gray/10">
            <h3 className="text-lg font-semibold text-slate-gray">
              {t('active_cg.accounts_count')} ({caregiversQ.data?.length ?? 0})
            </h3>
          </div>

          {caregiversQ.isLoading ? (
            <div className="p-6 text-slate-gray/70">{t('active_cg.loading_list')}</div>
          ) : caregiversQ.error ? (
            <div className="p-6">
              <ErrorMessage message={(caregiversQ.error as Error).message} />
            </div>
          ) : (caregiversQ.data?.length ?? 0) === 0 ? (
            <div className="p-6 text-slate-gray/70">{t('active_cg.empty')}</div>
          ) : (
            <ul role="list" className="divide-y divide-slate-gray/10">
              {caregiversQ.data!.map((c) => (
                <li key={c.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-gray">
                          {c.display_name || "—"}
                        </span>
                        <span className="text-slate-gray/60">•</span>
                        <span className="text-slate-gray/70 text-sm">
                          {c.email || t('common.no_email')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-gray/60 mt-1">
                        Created {formatDateTime(c.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.disabled ? (
                        <span className="inline-flex items-center gap-1 text-sm text-slate-gray/70">
                          <XCircle className="w-4 h-4" />
                          {t('common.disabled')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-mint-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          {t('common.active')}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleM.mutate(c)}
                        disabled={toggleM.isPending}
                        aria-busy={toggleM.isPending}
                        className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-gray/30 px-3 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
                      >
                        {c.disabled ? t('common.enable') : t('common.disable')}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-gray/60">
          {t('active_cg.delete_note')}
        </p>
      </div>
    </div>
  );
}

function AddForm({
  busy,
  error,
  onSubmit,
}: {
  busy: boolean;
  error: Error | null;
  onSubmit: (values: { email: string; display_name: string }) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const { t } = useLocale();

  const signupSentMsg = t('active_cg.signup_email_sent');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        onSubmit({ email: email.trim(), display_name: displayName.trim() });
      }}
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
    >
      <div>
        <label className="block text-sm font-medium text-slate-gray mb-1">
          {t('active_cg.display_name_label')}
        </label>
        <input
          type="text"
          className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
          placeholder={t('active_cg.display_name_placeholder')}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-gray mb-1">
          {t('auth.email_label')}
        </label>
        <input
          type="email"
          required
          className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-2 text-base bg-warm-white text-slate-gray"
          placeholder={t('active_cg.email_placeholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-primary px-5 py-2.5 font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('active_cg.add_btn')}
        </button>
      </div>

      {error && (
        <div className="md:col-span-3 rounded-lg bg-peach-blush/30 border border-peach-blush p-3 text-sm text-slate-gray">
          {error.message === "Sign-up email sent. The caregiver will appear after they confirm."
            ? signupSentMsg
            : error.message}
        </div>
      )}
    </form>
  );
}
