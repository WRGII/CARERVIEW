// src/pages/AcceptInvite.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";

export default function AcceptInvite() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLocale();

  useEffect(() => {
    (async () => {
      const urlToken = params.get("t");
      const storedToken = sessionStorage.getItem("cv_join_token");
      const token = urlToken || storedToken || "";

      if (!token) {
        setStatus("error");
        setMsg(t('accept_invite.invalid_token'));
        return;
      }

      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        if (urlToken) {
          sessionStorage.setItem("cv_join_token", urlToken);
        }
        navigate({ pathname: "/", search: "?join=1", hash: "#get-started" }, { replace: true });
        return;
      }

      try {
        setStatus("idle");

        const { data: teamId, error: acceptErr } = await supabase.rpc("cv_accept_invite", { p_token: token });
        if (acceptErr) throw acceptErr;

        const { error: setErr } = await supabase.rpc("cv_set_active_team", { p_team: teamId });
        if (setErr) throw setErr;

        sessionStorage.removeItem("cv_join_token");
        setStatus("ok");
        navigate("/caregiver", { replace: true });
      } catch (e: any) {
        sessionStorage.removeItem("cv_join_token");
        setStatus("error");
        setMsg(e?.message || t('accept_invite.failed'));
      }
    })();
  }, [params, navigate]);

  if (status === "idle") return <div className="p-6">{t('accept_invite.joining')}</div>;
  if (status === "error") return (
    <div className="p-6">
      <div className="text-red-600 mb-4">{msg}</div>
      <a href="/" className="text-cyan-primary hover:underline">{t('common.go_home')}</a>
    </div>
  );
  return <div className="p-6">{t('accept_invite.success')}</div>;
}
