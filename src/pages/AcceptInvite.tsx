// src/pages/AcceptInvite.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AcceptInvite() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const token = params.get("t") || localStorage.getItem("cv_join_token") || "";
      if (!token) { setStatus("error"); setMsg("Missing token"); return; }

      const { data: sess } = await supabase.auth.getSession();
      if (!sess?.session) {
        localStorage.setItem("cv_join_token", token);
        navigate({ pathname: "/", search: "?join=1", hash: "#get-started" }, { replace: true });
        return;
      }

      try {
        setStatus("idle");
        // accept → returns team_id
        const { data: teamId, error: acceptErr } = await supabase.rpc("cv_accept_invite", { p_token: token });
        if (acceptErr) throw acceptErr;

        // set active team
        const { error: setErr } = await supabase.rpc("cv_set_active_team", { p_team: teamId });
        if (setErr) throw setErr;

        // cleanup and go
        localStorage.removeItem("cv_join_token");
        setStatus("ok");
        navigate("/caregiver", { replace: true });
      } catch (e: any) {
        setStatus("error");
        setMsg(e?.message || "Join failed");
      }
    })();
    // only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "idle") return <div className="p-6">Joining…</div>;
  if (status === "error") return <div className="p-6 text-red-600">{msg}</div>;
  return <div className="p-6">Joined. Redirecting…</div>;
}
