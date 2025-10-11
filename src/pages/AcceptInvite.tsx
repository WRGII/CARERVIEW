import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cvAcceptInvite } from "../lib/cv";
import { supabase } from "../lib/supabaseClient";

export default function AcceptInvite() {
  const [status, setStatus] = useState<"idle"|"ok"|"error">("idle");
  const [msg, setMsg] = useState("");
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const t = params.get("t");
      if (!t) { setStatus("error"); setMsg("Missing token"); return; }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        // not signed in → stash token and send to sign-in
        localStorage.setItem("cv_join_token", t);
        nav({ pathname: "/", search: "?join=1", hash: "#get-started" }, { replace: true });
        return;
      }

      setStatus("idle");
      cvAcceptInvite(t)
        .then(() => { setStatus("ok"); nav("/caregiver", { replace: true }); })
        .catch((e:any) => { setStatus("error"); setMsg(e.message ?? "Join failed"); });
    })();
  }, []);

  if (status === "idle") return <div className="p-6">Joining…</div>;
  if (status === "error") return <div className="p-6 text-red-600">{msg}</div>;
  return <div className="p-6">Joined. Redirecting…</div>;
}
// src/pages/AcceptInvite.tsx (core logic)
const token = new URLSearchParams(location.search).get('t') || '';
if (!token) { /* show error */ }

const { data: teamId, error } = await supabase.rpc('cv_accept_invite', { p_token: token });
if (error) throw error;

const { error: setErr } = await supabase.rpc('cv_set_active_team', { p_team: teamId });
if (setErr) throw setErr;

// redirect to dashboard
navigate('/caregiver', { replace: true });

