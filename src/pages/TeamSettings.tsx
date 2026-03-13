// src/pages/TeamSettings.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useActiveTeam } from "../context/ActiveTeam";
import { useUserPlan } from "../hooks/useUserPlan";
import { cvAmIOwner, cvCreateInvite, cvListMembers } from "../lib/cv";
import { useLocale } from "../i18n/LocaleContext";

type Member = {
  user_id: string;
  role: "owner" | "member";
  state: "active" | "frozen";
  joined_at: string;
};

export default function TeamSettings() {
  const { data: plan, isLoading: planLoading } = useUserPlan();
  const { teamId, loading } = useActiveTeam();
  const { t } = useLocale();

  const [members, setMembers] = useState<Member[]>([]);
  const [owner, setOwner] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isPlanAllowed = !planLoading && plan?.plan_id === "family_qtr";

  // Load members + owner flag — must be before any conditional returns
  useEffect(() => {
    if (!teamId || !isPlanAllowed) return;
    let mounted = true;
    (async () => {
      setError(null);
      try {
        const [m, o] = await Promise.all([cvListMembers(teamId), cvAmIOwner(teamId)]);
        if (!mounted) return;
        setMembers(m);
        setOwner(o);
      } catch (e: any) {
        if (!mounted) return;
        setError(e.message ?? t('team.load_failed'));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [teamId, isPlanAllowed]);

  if (planLoading) return null;
  if (!isPlanAllowed) return <Navigate to="/caregiver" replace />;

  async function onInvite() {
    if (!teamId || !email) return;
    setBusy(true);
    setError(null);
    setInviteLink(null);
    try {
      const token = await cvCreateInvite(teamId, email.trim());
      setInviteLink(`${window.location.origin}/join?t=${encodeURIComponent(token)}`);
      setEmail("");
    } catch (e: any) {
      setError(e.message ?? t('team.invite_failed'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6">{t('common.loading')}</div>;
  if (!teamId) return <div className="p-6">{t('team.no_circle')}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t('team.title')}</h1>

      {error && <div className="text-red-600">{error}</div>}

      <section>
        <h2 className="font-medium mb-2">{t('team.caregivers')}</h2>
        <ul className="space-y-1">
          {members.map((m) => (
            <li key={m.user_id} className="text-sm">
              {m.role} · {m.state} · {new Date(m.joined_at).toLocaleString()}
            </li>
          ))}
          {members.length === 0 && <li className="text-sm text-slate-500">{t('team.no_members')}</li>}
        </ul>
      </section>

      {owner && (
        <section className="space-y-2">
          <h2 className="font-medium">{t('team.invite_title')}</h2>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder={t('team.invite_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 w-72"
            />
            <button
              onClick={onInvite}
              disabled={busy || !email}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {busy ? t('common.sending') : t('team.invite_btn')}
            </button>
          </div>
          {inviteLink && (
            <div className="text-sm mt-2">
              {t('team.invite_link_label')} <code className="break-all">{inviteLink}</code>
              <div className="text-slate-500">{t('team.invite_copy_note')}</div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
