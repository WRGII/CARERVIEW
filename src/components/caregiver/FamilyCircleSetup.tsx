import { useState } from "react";
import { useActiveTeam } from "../../context/ActiveTeam";
import { cvCreateInvite, cvCreateTeamWithPatient } from "../../lib/cv";
import { hasActivePlan, useUserPlan } from "../../hooks/useUserPlan";
import { useLocale } from '../../i18n/LocaleContext';
import { Loading } from '../ui/Loading';

type Invite = { name: string; email: string };

export default function FamilyCircleSetup() {
  const { teamId, refresh: refreshTeam } = useActiveTeam();
  const { t, isLoading: translationsLoading } = useLocale();
  const { data: plan } = useUserPlan();
  const [patient, setPatient] = useState("");
  const [invites, setInvites] = useState<Invite[]>([{ name: "", email: "" }, { name: "", email: "" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);

  const eligible = plan?.plan_id === "family_qtr" && hasActivePlan(plan) && !teamId;

  if (!eligible) return null;
  if (translationsLoading) return <Loading />;

  async function onCreate() {
    setBusy(true);
    setError(null);
    setLinks([]);
    try {
      if (!patient.trim()) throw new Error(t('family_setup.patient_required'));
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
        const result = await cvCreateInvite(newTeamId, email);
        linksOut.push(`${location.origin}/join?t=${encodeURIComponent(result.token)}`);
      }
      setLinks(linksOut);
    } catch (e: any) {
      setError(e.message ?? t('family_setup.create_failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-2">{t('family_setup.title')}</h2>
      <p className="text-slate-600 mb-4">{t('family_setup.subtitle')}</p>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <label className="block mb-2 text-sm font-medium">{t('family_setup.patient_label')}</label>
      <input
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
        placeholder={t('family_setup.patient_placeholder')}
        className="border rounded-lg px-3 py-2 w-full mb-4"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {invites.map((row, i) => (
          <div key={i} className="space-y-2">
            <label className="block text-sm font-medium">{`${t('family_setup.invite_label')} ${i + 1} ${t('common.optional_parens')}`}</label>
            <input
              value={row.name}
              onChange={(e) => {
                const c = [...invites]; c[i].name = e.target.value; setInvites(c);
              }}
              placeholder={t('family_setup.caregiver_name_placeholder')}
              className="border rounded-lg px-3 py-2 w-full"
            />
            <input
              type="email"
              value={row.email}
              onChange={(e) => {
                const c = [...invites]; c[i].email = e.target.value; setInvites(c);
              }}
              placeholder={t('team.invite_placeholder')}
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
          {busy ? t('common.creating') : t('family_setup.create_btn')}
        </button>
      </div>

      {links.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">{t('family_setup.invite_links_title')}</h3>
          <ol className="list-decimal pl-6 space-y-1 text-sm">
            {links.map((l, i) => (
              <li key={i}><code className="break-all">{l}</code></li>
            ))}
          </ol>
          <p className="text-slate-500 text-sm mt-2">{t('family_setup.invite_links_note')}</p>
        </div>
      )}
    </div>
  );
}
