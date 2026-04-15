// src/pages/AcceptInvite.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";

type ErrorKind = "expired" | "consumed" | "already_member" | "invalid" | "generic";

function classifyError(message: string): ErrorKind {
  const lower = message.toLowerCase();
  if (lower.includes("expir")) return "expired";
  if (lower.includes("already a member")) return "already_member";
  if (lower.includes("already") || lower.includes("consumed") || lower.includes("used")) return "consumed";
  if (lower.includes("invalid") || lower.includes("not found")) return "invalid";
  return "generic";
}

export default function AcceptInvite() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("generic");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    (async () => {
      const urlToken = params.get("t");
      const storedToken = localStorage.getItem("cv_join_token");
      const token = urlToken || storedToken || "";

      if (!token) {
        setStatus("error");
        setMsg(t('accept_invite.invalid_token'));
        return;
      }

      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        if (urlToken) {
          localStorage.setItem("cv_join_token", urlToken);
        }
        navigate(`/invite-setup?t=${encodeURIComponent(token)}`, { replace: true });
        return;
      }

      try {
        setStatus("idle");

        const user = sess.session.user;
        const { error: profileErr } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? null,
          display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "",
          role: "caregiver",
          disabled: false,
        }, { onConflict: "id" });
        if (profileErr) throw profileErr;

        const { data: teamId, error: acceptErr } = await supabase.rpc("cv_accept_invite", { p_token: token });
        if (acceptErr) throw acceptErr;

        const { error: setErr } = await supabase.rpc("cv_set_active_team", { p_team: teamId });
        if (setErr) throw setErr;

        localStorage.removeItem("cv_join_token");
        setStatus("ok");
        navigate("/caregiver", { replace: true });
      } catch (e: any) {
        localStorage.removeItem("cv_join_token");
        const rawMsg: string = e?.message || "";
        const kind = classifyError(rawMsg);
        if (kind === "already_member") {
          navigate("/caregiver", { replace: true });
          return;
        }
        setErrorKind(kind);
        setStatus("error");
        setMsg(rawMsg || t('accept_invite.failed'));
      }
    })();
  }, [params, navigate]);

  if (status === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">{t('accept_invite.joining')}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    const isExpired = errorKind === "expired";
    const isConsumed = errorKind === "consumed";
    const title = isExpired
      ? t('accept_invite.error_expired_title')
      : isConsumed
      ? t('accept_invite.error_consumed_title')
      : t('accept_invite.error_title');
    const body = isExpired
      ? t('accept_invite.error_expired_body')
      : isConsumed
      ? t('accept_invite.error_consumed_body')
      : msg || t('accept_invite.failed');

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm mb-6">{body}</p>
          <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            {t('common.go_home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-green-100 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-slate-700 font-medium">{t('accept_invite.success')}</p>
      </div>
    </div>
  );
}
