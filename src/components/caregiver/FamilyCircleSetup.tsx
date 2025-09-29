import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActiveTeam } from "../../context/ActiveTeam";
import { cvCreateInvite, cvCreateTeamWithPatient } from "../../lib/cv";
import { useUserPlan } from "../../hooks/useUserPlan";

type Invite = { name: string; email: string };

export default function FamilyCircleSetup() {
  const { teamId, refresh: refreshTeam } = useActiveTeam();
  const { data: plan } = useUserPlan(); // must return plan_id like 'family_qtr'
  const [patient, setPatient] = useState("");
  const [invites, setInvites] = useState<Invite[]>([{ name: "", email: "" }, { name: "", email: "" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);

  const eligible = plan?.plan_id === "family_qtr" && !teamId;

  if (!eligible) return null;

  async function onCreate() {
    setBusy(true);
    setError(null);
    setLinks([]);
    try {
      if (!patient.trim()) throw new Error("Enter the patient’s full name.");
      // 1) create team
      const newTeamId = await cvCreateTeamWithPatient({
        name: `${patient.trim()} Family Circle`,
        plan_id: "family_qtr",
        patient_name: patient.trim(),
        gender: "unknown",
      });
      await refreshTeam();

      // 2) send up to two invites if emails provided
      const linksOut: string[] = [];
      for (const row of invites) {
        const email = row.email.trim();
        if (!email) continue;
        const token = await cvCreateInvite(newTeamId, email);
        linksOut.push(`${location.origin}/join?t=${encodeURIComponent(token)}`);
      }
      setLinks(linksOut);
    } catch (e: any) {
      setError(e.message ?? "Failed to create Family Circle");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-2">Create your Family Circle</h2>
      <p className="text-slate-600 mb-4">One patient, up to two invited caregivers.</p>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <label className="block mb-2 text-sm font-medium">Patient full name</label>
      <input
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
        placeholder="e.g., Pat Jones"
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {invites.map((row, i) => (
          <div key={i} className="space-y-2">
            <label className="block text-sm font-medium">Invite {i + 1} (optional)</label>
            <input
              value={row.name}
              onChange={(e) => {
                const c = [...invites]; c[i].name = e.target.value; setInvites(c);
              }}
              placeholder="Caregiver name"
              className="border rounded-lg px-3 py-2 w-full"
            />
            <input
              type="email"
              value={row.email}
              onChange={(e) => {
                const c = [...invites]; c[i].email = e.target.value; setInvites(c);
              }}
              placeholder="caregiver@email"
              className="border rounded-lg px-3 py-2 w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={onCreate}
          disabled={busy || !patient.trim()}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create Family Circle"}
        </button>
      </div>

      {links.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Invite links</h3>
          <ol className="list-decimal pl-6 space-y-1 text-sm">
            {links.map((l, i) => (
              <li key={i}><code className="break-all">{l}</code></li>
            ))}
          </ol>
          <p className="text-slate-500 text-sm mt-2">Copy and send these now. Later we’ll send product emails automatically.</p>
        </div>
      )}
    </div>
  );
}
