// src/pages/NewObservationPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { SquareActivity as ActivitySquare, ClipboardList, Layers, ArrowRight, Activity } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Loading } from '../components/ui/Loading';

import { useActiveTeam } from '../context/ActiveTeam';
import { cvGetRemaining, cvGetSoloRemaining } from '../lib/cv';
import { useMemberFrozen } from '../hooks/useMemberFrozen';
import { setLastModule } from '../lib/lastModule';
import { useTeamResident } from '../hooks/useMemoryBook';
import { useDeleteObservation, useObservations } from '../hooks/useObservations';
import { useToast } from '../components/ui/ToastProvider';
import { exportToDOCX, exportToCSV } from '../lib/exports';
import { localeToIntl } from '../lib/utils';
import { ObservationList } from '../components/caregiver/ObservationList';
import { ViewObservation } from '../components/caregiver/ViewObservation';

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE';
type ViewMode = 'list' | 'view';
type ExportFormat = 'docx' | 'csv';

export default function NewObservationPage() {
  const navigate = useNavigate();
  const { user, profile, loading, error } = useAuth();
  const { t, locale } = useLocale();
  const { showToast } = useToast();

  const { teamId } = useActiveTeam();
  const { data: resident } = useTeamResident(teamId ?? null);
  const [remaining, setRemaining] = React.useState<number | null>(null);
  const frozen = useMemberFrozen(teamId ?? null);

  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const { data: observations = [] } = useObservations();
  const deleteObservationMutation = useDeleteObservation();
  const intlLocale = localeToIntl(locale);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null);
  const [exportingFor, setExportingFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  React.useEffect(() => { setLastModule('observations'); }, []);

  // Load remaining quota — team-based or solo
  React.useEffect(() => {
    (async () => {
      try {
        if (teamId) {
          setRemaining(await cvGetRemaining(teamId));
        } else {
          setRemaining(await cvGetSoloRemaining());
        }
      } catch {
        setRemaining(null);
      }
    })();
  }, [teamId]);

  // Auth guards
  if (loading) return <Loading message={t('new_obs.loading')} />;
  if (error || !user) return <ErrorMessage message={error || t('common.auth_required')} />;
  if (!profile) return <ErrorMessage message={t('common.profile_not_found')} />;
  if (profile.disabled) return <ErrorMessage message={t('common.account_disabled')} />;

  const quotaExhausted = remaining !== null && remaining <= 0;

  function handleViewObservation(id: string) {
    setCurrentObservationId(id);
    setViewMode('view');
  }

  async function handleDeleteObservation(observationId: string) {
    if (deletingId) return;
    setDeletingId(observationId);
    try {
      await deleteObservationMutation.mutateAsync(observationId);
      showToast(t('obs_list.delete_success'), 'success');
    } catch (e: any) {
      showToast(e?.message ?? t('obs_list.delete_error'), 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExportObservation(observationId: string, format: ExportFormat) {
    if (exportingFor) return;
    setExportingFor(observationId);
    try {
      const { data: obs, error: obsErr } = await supabase
        .from('observations')
        .select(`
          id, user_id, resident_name, observation_date, notes, caregiver_name, caregiver_email, created_at, updated_at, form_type,
          responses:responses (
            id, observation_id, question_id, score, notes, created_at, updated_at,
            question:questions (
              id, question_text, sort_order,
              category:categories ( id, name, type )
            )
          )
        `)
        .eq('id', observationId)
        .single();
      if (obsErr) throw obsErr;

      const { data: legend } = await supabase.from('legend').select('*').order('score', { ascending: true });

      const catMap = new Map<string, { id: string; name: string; type: string; questions: { id: string; category_id: string; question_text: string; sort_order: number }[] }>();
      for (const r of (obs as any)?.responses ?? []) {
        const q = Array.isArray(r.question) ? r.question[0] : r.question;
        const c = q?.category ? (Array.isArray(q.category) ? q.category[0] : q.category) : null;
        if (!q || !c) continue;
        if (!catMap.has(c.id)) catMap.set(c.id, { id: c.id, name: c.name, type: c.type, questions: [] });
        catMap.get(c.id)!.questions.push({ id: q.id, category_id: c.id, question_text: q.question_text, sort_order: q.sort_order });
      }
      const categories = Array.from(catMap.values());
      categories.forEach((cat) => cat.questions.sort((a, b) => a.sort_order - b.sort_order));

      if (format === 'docx') {
        await exportToDOCX(obs as any, categories as any, legend as any, t, intlLocale);
      } else {
        await exportToCSV(obs as any, categories as any, legend as any, t, intlLocale);
      }
    } catch (e: any) {
      showToast(e?.message ?? t('export.error'), 'error');
    } finally {
      setExportingFor(null);
    }
  }

  async function createAndStart(mode: FormType) {
    try {
      setBusy(true); setErr(null);

      if (frozen) throw new Error(t('new_obs.seat_frozen'));
      if (quotaExhausted) throw new Error(t('new_obs.quota_reached'));

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

      const insertPayload: Record<string, unknown> = {
        user_id: user!.id,
        form_type: mode,
        observation_date,
        caregiver_name,
        caregiver_email,
        author_user_id: user!.id,
        resident_name: resident?.full_name ?? null,
      };

      if (teamId) {
        insertPayload.team_id = teamId;
      }

      const { data, error: insErr } = await supabase
        .from('observations')
        .insert(insertPayload)
        .select('id')
        .single();

      if (insErr) throw insErr;

      // optimistic decrement
      if (remaining !== null) setRemaining(Math.max(remaining - 1, 0));

      window.plausible?.('Observation Created', { props: { type: mode } });
      navigate(`/caregiver/observations/${data.id}/edit`);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  function getRemainingLabel(): string | null {
    if (remaining === null) return null;
    if (remaining === 1) return t('new_obs.solo_remaining_one');
    return t('new_obs.solo_remaining_other').replace('{{count}}', String(remaining));
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
      disabled={busy || frozen || quotaExhausted}
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

  if (viewMode === 'view' && currentObservationId) {
    return (
      <PageLayout
        title={t('new_obs.page_title')}
        user={{ ...user, profile }}
        hideSignOut={true}
        headerRight={<Button variant="outline" onClick={() => navigate('/caregiver')}>{t('common.back_dashboard')}</Button>}
      >
        <ViewObservation
          observationId={currentObservationId}
          onBack={() => { setCurrentObservationId(null); setViewMode('list'); }}
          onExport={handleExportObservation}
          onDelete={async (id) => { await handleDeleteObservation(id); setCurrentObservationId(null); setViewMode('list'); }}
          isExporting={exportingFor === currentObservationId}
          isDeleting={deletingId === currentObservationId}
        />
      </PageLayout>
    );
  }

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
          {teamId && remaining !== null && (
            <p className="mt-2 text-sm text-slate-600">{t('new_obs.remaining_prefix')} {remaining}</p>
          )}
          {!teamId && remaining !== null && !quotaExhausted && (
            <p className="mt-2 text-sm text-slate-600">{getRemainingLabel()}</p>
          )}
          {frozen && <p className="mt-2 text-sm text-red-600">{t('new_obs.seat_frozen')}</p>}
        </div>

        {/* Upgrade prompt when quota is exhausted */}
        {quotaExhausted ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-slate-800">
                {t('new_obs.solo_quota_reached_title')}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {t('new_obs.solo_quota_reached_body')}
              </p>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              {t('new_obs.solo_quota_reached_cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {err && <div className="text-red-600 text-sm">{err}</div>}
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
          </>
        )}

        {/* Past observations */}
        {observations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <Activity className="w-4 h-4 text-amber-500 shrink-0" />
              <h2 className="text-base font-semibold text-slate-800">{t('caregiver.observations_title')}</h2>
              <span className="ml-auto text-xs font-medium text-slate-400">{observations.length}</span>
            </div>
            <ObservationList
              onViewObservation={handleViewObservation}
              onExportObservation={handleExportObservation}
              onDeleteObservation={handleDeleteObservation}
              deletingId={deletingId}
            />
          </div>
        )}

        <div>
          <Button variant="outline" onClick={() => navigate('/caregiver')} disabled={busy}>
            {t('common.back_dashboard')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
