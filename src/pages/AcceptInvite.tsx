import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cvAcceptInvite } from "../lib/cv";

export default function AcceptInvite() {
  const [status, setStatus] = useState<"idle"|"ok"|"error">("idle");
  const [msg, setMsg] = useState("");
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const t = params.get("t");
    if (!t) { setStatus("error"); setMsg("Missing token"); return; }
    cvAcceptInvite(t)
      .then(() => { setStatus("ok"); nav("/caregiver"); })
      .catch((e:any) => { setStatus("error"); setMsg(e.message ?? "Join failed"); });
  }, []);

  if (status === "idle") return <div className="p-6">Joining…</div>;
  if (status === "error") return <div className="p-6 text-red-600">{msg}</div>;
  return <div className="p-6">Joined. Redirecting…</div>;
}
