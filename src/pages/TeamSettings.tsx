import { useEffect, useState } from "react";
import { useActiveTeam } from "../context/ActiveTeam";
import { cvAmIOwner, cvCreateInvite, cvListMembers } from "../lib/cv";

type Member = { user_id: string; role: "owner"|"member"; state: "active"|"frozen"; joined_at: string };

export default function TeamSettings() {
  const { teamId, loading } = useActiveTeam();
  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    let mounted = true;
    (async () => {
      setError(null);
      try {
        const [m, o] = await Promise.all([cvListMembers(teamId), cvAmIOwner(teamId)]);
        if (!mounted) return;
        setMembers(m);
        setOwner(o);
      } catch (e:any) {
        if (!mounted) return;
        setError(e.message ?? "Failed to load team");
      }
    })();
    return () => { mounted = false; };
  }, [teamId]);

  async function onInvite() {
    if (!teamId || !email) return;
    setBusy(true);
    setError(null);
    setInviteLink(null);
    try {
      const token = await cvCreateInvite(teamId, email.trim());
      setInviteLink(`${location.origin}/join?t=${encodeURIComponent(token)}`);
      setEmail("");
    } catch (e:any) {
      setError(e.message ?? "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!teamId) return <div className="p-6">Create your Family Circle first.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Family Circle</h1>

      {error && <div className="text-red-600">{error}</div>}

      <section>
        <h2 className="font-medium mb-2">Caregivers</h2>
        <ul className="space-y-1">
          {members.map(m => (
            <li key={m.user_id} className="text-sm">
              {m.role} · {m.state} · {new Date(m.joined_at).toLocaleString()}
            </li>
          ))}
          {members.length === 0 && <li className="text-sm text-slate-500">No members yet.</li>}
        </ul>
      </section>

      {owner && (
        <section className="space-y-2">
          <h2 className="font-medium">Invite caregiver</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="caregiver@email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 w-72"
            />
            <button
              onClick={onInvite}
              disabled={busy || !email}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {busy ? "Sending…" : "Invite"}
            </button>
          </div>
          {inviteLink && (
            <div className="text-sm mt-2">
              Invite link:&nbsp;
              <code className="break-all">{inviteLink}</code>
              <div className="text-slate-500">Copy this into an email now. Later you can send via your mailer.</div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
