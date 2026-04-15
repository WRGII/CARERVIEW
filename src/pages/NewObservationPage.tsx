// src/pages/NewObservationPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { SquareActivity as ActivitySquare, ClipboardList, Layers } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Loading } from '../components/ui/Loading';

import { useActiveTeam } from '../context/ActiveTeam';
import { cvGetRemaining } from '../lib/cv';
import { useMemberFrozen } from '../hooks/useMemberFrozen';

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE';

export default function NewObservationPage() {
  const navigate = useNavigate();
  const { user, profile, loading, error } = useAuth();
  const { t } = useLocale();

  const { teamId } = useActiveTeam();
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const frozen = useMemberFrozen(teamId ?? null);

  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // Load remaining team quota
  React.useEffect(() => {
    (async () => {
      if (!teamId) { setRemaining(null); return; }
      try { setRemaining(await cvGetRemaining(teamId)); }
      catch { setRemaining(null); }
    })();
  }, [teamId]);

  // Auth guards
  if (loading) return <Loading message={t('new_obs.loading')} />;
  if (error || !user) return <ErrorMessage message={error || t('common.auth_required')} />;
  if (!profile) return <ErrorMessage message={t('common.profile_not_found')} />;
  if (profile.disabled) return <ErrorMessage message={t('common.account_disabled')} />;

  async function createAndStart(mode: FormType) {
    try {
      setBusy(true); setErr(null);

      if (!teamId) throw new Error(t('new_obs.no_team'));
      if (frozen) throw new Error(t('new_obs.seat_frozen'));
      if (remaining !== null && remaining <= 0) throw new Error(t('new_obs.quota_reached'));

      // Build required fields
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const observation_date = `${yyyy}-${mm}-${dd}`;

      const caregiver_name =
        (profile?.display_name?.trim?.() || '') ||
        (profile?.email?.trim?.() || '') ||
        (user?.email?.trim?.() || 'Caregiver');

      const caregiver_email =
        (profile?.email?.trim?.() || '') ||
        (user?.email?.trim?.() || '');

      if (!caregiver_email) {
        throw new Error(t('new_obs.email_missing'));
      }

      const { data, error: insErr } = await supabase
        .from('observations')
        .insert({
          user_id: user!.id,
          form_type: mode,
          observation_date,
          caregiver_name,
          caregiver_email,
          team_id: teamId,
          author_user_id: user!.id,
          // optional: resident_name, notes, mode_of_observation
        })
        .select('id')
        .single();

      if (insErr) throw insErr;

      // optimistic decrement
      if (remaining !== null) setRemaining(Math.max(remaining - 1, 0));

      window.plausible('Observation Created', { props: { type: mode } });
      navigate(`/caregiver/observations/${data.id}`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const Tile = ({
    title,
    desc,
    icon,
    onClick,
    badge,
  }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    badge?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left focus:outline-none"
      aria-label={title}
      disabled={busy || frozen || !teamId || (remaining !== null && remaining <= 0)}
    >
      <Card className="bg-warm-white hover:shadow-lg transition-shadow duration-200 h-full disabled:opacity-60">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-primary/15 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-gray">{title}</h3>
                {badge && (
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-mint-green/70 text-slate-gray border border-mint-green/70">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-slate-gray/80 mt-1">{desc}</p>
              <div className="mt-4">
                <span className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-gray/30 px-3 py-1.5 text-sm font-semibold text-slate-gray">
                  {t('common.start')}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );

  return (
    <PageLayout
      title={t('new_obs.page_title')}
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={<Button variant="outline" onClick={() => navigate('/caregiver')}>{t('common.back_dashboard')}</Button>}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-gray">{t('new_obs.create_title')}</h1>
          <p className="text-slate-gray/70">{t('new_obs.choose_type')}</p>
          {/* Status line */}
          {!teamId && <p className="mt-2 text-sm text-amber-700">{t('new_obs.no_team')}</p>}
          {teamId && remaining !== null && (
            <p className="mt-2 text-sm text-slate-600">{t('new_obs.remaining_prefix')} {remaining}</p>
          )}
          {frozen && <p className="mt-2 text-sm text-red-600">{t('new_obs.seat_frozen')}</p>}
        </div>

        {err && <div className="text-red-600">{err}</div>}

        <div className="grid gap-6 md:grid-cols-2">
          <Tile
            title={t('new_obs.adl_title')}
            desc={t('new_obs.adl_desc')}
            icon={<ActivitySquare className="w-6 h-6 text-cyan-primary" />}
            onClick={() => createAndStart('ADL')}
          />
          <Tile
            title={t('new_obs.iadl_title')}
            desc={t('new_obs.iadl_desc')}
            icon={<ClipboardList className="w-6 h-6 text-cyan-primary" />}
            onClick={() => createAndStart('IADL')}
          />
          <div className="md:col-span-2">
            <Tile
              title={t('new_obs.comprehensive_title')}
              desc={t('new_obs.comprehensive_desc')}
              icon={<Layers className="w-6 h-6 text-cyan-primary" />}
              badge={t('pricing.recommended')}
              onClick={() => createAndStart('COMPREHENSIVE')}
            />
          </div>
        </div>

        <div>
          <Button variant="outline" onClick={() => navigate('/caregiver')} disabled={busy}>
            {t('common.back_dashboard')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
