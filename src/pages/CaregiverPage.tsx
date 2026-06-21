import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Activity, ArrowRight, Clock, BookOpen, ClipboardList, Lock } from 'lucide-react';
import GuidedTutorial from '../components/caregiver/GuidedTutorial';
import GuestInviteModal from '../components/caregiver/GuestInviteModal';

import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { PageLayout } from '../components/layout/PageLayout';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';
import { exportToDOCX, exportToCSV } from '../lib/exports';
import InactivePlanNotice from '../components/caregiver/InactivePlanNotice';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { useOnboarding } from '../hooks/useOnboarding';
import { prefetchObservationFormAssets } from '../lib/prefetching';
import FamilyCircleSetup from '../components/caregiver/FamilyCircleSetup';
import DashboardCarePlanPanel from '../components/caregiver/DashboardCarePlanPanel';
import DashboardMemoryBookPanel from '../components/caregiver/DashboardMemoryBookPanel';
import DashboardResidentPanel from '../components/caregiver/DashboardResidentPanel';
import { useDeleteObservation, useObservations } from '../hooks/useObservations';
import { useToast } from '../components/ui/ToastProvider';
import { localeToIntl } from '../lib/utils';
import { getLastModule, type LastModule } from '../lib/lastModule';
import { ObservationList } from '../components/caregiver/ObservationList';
import { ViewObservation } from '../components/caregiver/ViewObservation';
import { useUserTeamsResidents } from '../hooks/useMemoryBook';
import { cvGetSoloRemaining } from '../lib/cv';

type ViewMode = 'list' | 'view';
type ExportFormat = 'docx' | 'csv';

// ── How the tools work together panel ────────────────────────────────────────

function HowToolsWorkPanel({ t }: { t: (k: string, v?: Record<string, string | number>) => string }) {
  const items = [
    {
      label: t('care_hub.mental_model_mb_label'),
      tag: t('care_hub.mental_model_mb_tag'),
      body: t('care_hub.mental_model_mb_body'),
      dot: 'bg-teal-400',
    },
    {
      label: t('care_hub.mental_model_cp_label'),
      tag: t('care_hub.mental_model_cp_tag'),
      body: t('care_hub.mental_model_cp_body'),
      dot: 'bg-blue-400',
    },
    {
      label: t('care_hub.mental_model_obs_label'),
      tag: t('care_hub.mental_model_obs_tag'),
      body: t('care_hub.mental_model_obs_body'),
      dot: 'bg-amber-400',
    },
  ]
  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
        {t('care_hub.mental_model_heading')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <span className="text-sm font-bold text-white">{item.label}</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-2">{item.tag}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CaregiverPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user, profile, loading, error } = useAuth();
  const { data: plan } = useUserPlan();
  const planActive = hasActivePlan(plan);
  const isPaid = planActive && plan?.plan_id !== 'free';
  const { showToast } = useToast();
  const deleteObservationMutation = useDeleteObservation();
  const { t, locale } = useLocale();
  const intlLocale = localeToIntl(locale);
  const { data: observations = [] } = useObservations();
  const { restartTutorial } = useOnboarding();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null);
  const [exportingFor, setExportingFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastModule, setLastModule] = useState<LastModule>(null);
  const [showGuestInvite, setShowGuestInvite] = useState(false);
  const [soloRemaining, setSoloRemaining] = useState<number | null>(null);

  const { data: residentOptions = [] } = useUserTeamsResidents(user?.id);

  useEffect(() => {
    setLastModule(getLastModule());
  }, []);

  useEffect(() => {
    if (user?.id) {
      prefetchObservationFormAssets(queryClient, user.id).catch(() => {});
    }
  }, [user?.id, queryClient]);

  useEffect(() => {
    if (!isPaid && user?.id) {
      cvGetSoloRemaining().then(setSoloRemaining).catch(() => setSoloRemaining(null));
    }
  }, [isPaid, user?.id]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      newUrl.searchParams.delete('plan');
      window.history.replaceState({}, '', newUrl.toString());
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('startTutorial') === 'true') {
      restartTutorial();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('startTutorial');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, restartTutorial]);

  if (loading) return <Loading message={t('caregiver.loading')} />;
  if (error || !user) return <ErrorMessage message={error || t('common.auth_required')} />;
  if (!profile) return <ErrorMessage message={t('common.profile_not_found')} />;
  if (profile.disabled) return <ErrorMessage message={t('common.account_disabled')} />;

  function handleViewObservation(id: string) {
    setCurrentObservationId(id);
    setViewMode('view');
  }

  async function handleDeleteObservation(observationId: string) {
    if (deletingId) return;
    setDeletingId(observationId);
    try {
      await deleteObservationMutation.mutateAsync(observationId);
      await queryClient.invalidateQueries({ queryKey: ['observations', user?.id] });
      showToast(t('caregiver.obs_deleted'), 'success');
    } catch (e: any) {
      showToast(e?.message || t('caregiver.obs_delete_failed'), 'error');
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
          id, user_id, resident_name, observation_date, notes, caregiver_name, caregiver_email, created_at, updated_at,
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
      if (obsErr) throw new Error(`${t('caregiver.obs_load_failed')}: ${obsErr.message}`);
      if (!obs) throw new Error(t('caregiver.obs_not_found'));

      const { data: legend, error: legErr } = await supabase
        .from('legend')
        .select('*')
        .order('score', { ascending: true });
      if (legErr) throw new Error(`${t('caregiver.legend_load_failed')}: ${legErr.message}`);

      const responses = (obs.responses ?? []).map((r: any) => {
        const q = Array.isArray(r.question) ? r.question[0] : r.question;
        const c = q?.category ? (Array.isArray(q.category) ? q.category[0] : q.category) : null;
        return { question: q ? { id: q.id, question_text: q.question_text, sort_order: q.sort_order, category: c } : null };
      });

      const catMap = new Map<string, { id: string; name: string; type: 'ADL' | 'IADL'; questions: { id: string; category_id: string; question_text: string; sort_order: number }[] }>();
      for (const r of responses) {
        const q = r?.question;
        const c = q?.category;
        if (!q || !c) continue;
        if (!catMap.has(c.id)) catMap.set(c.id, { id: c.id, name: c.name, type: c.type, questions: [] });
        catMap.get(c.id)!.questions.push({ id: q.id, category_id: c.id, question_text: q.question_text, sort_order: q.sort_order });
      }
      const categories = Array.from(catMap.values());
      categories.forEach((cat) => cat.questions.sort((a, b) => a.sort_order - b.sort_order));
      categories.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type));

      if (format === 'docx') {
        await exportToDOCX(obs as any, categories as any, legend as any, t, intlLocale);
      } else {
        await exportToCSV(obs as any, categories as any, legend as any, t, intlLocale);
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to export observation.');
    } finally {
      setExportingFor(null);
    }
  }

  function getContextSubtitle(): string {
    if (!isPaid) return t('caregiver.subtitle_free');
    if (lastModule === 'care_plan') return t('caregiver.subtitle_care_plan');
    if (lastModule === 'memory_book') return t('caregiver.subtitle_memory_book');
    if (lastModule === 'observations') return t('caregiver.subtitle_observations');
    return t('caregiver.subtitle_default');
  }

  // ── Observations section (hero feature in paid layout) ────────────────────

  function renderObservationsSection() {
    const recentObs = (observations as any[]).slice(0, 5)

    return (
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden" data-tutorial="new-observation">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{t('caregiver.observations_title')}</h2>
              <p className="text-xs font-semibold text-amber-600 mt-0.5">{t('care_hub.mental_model_obs_tag')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuestInvite(true)}
              className="hidden sm:flex text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-300 hover:bg-cyan-100 hover:border-cyan-400 rounded-lg px-3 py-1.5 transition-colors items-center gap-1.5"
              title={t('guest_invite.button_tooltip')}
            >
              {t('guest_invite.button_label')}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/caregiver/observations/new')}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('caregiver.new_obs_btn')}
            </Button>
          </div>
        </div>

        {observations.length === 0 ? (
          /* Empty state */
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 text-amber-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">{t('caregiver.obs_empty')}</p>
            <p className="text-xs text-slate-400 mb-5 max-w-xs leading-relaxed">
              {t('care_hub.mental_model_obs_body')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/caregiver/observations/new')}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('caregiver.obs_empty_cta')}
              </Button>
              <button
                onClick={() => setShowGuestInvite(true)}
                className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-300 hover:bg-cyan-100 rounded-lg px-4 py-2 transition-colors"
              >
                {t('guest_invite.button_label')}
              </button>
            </div>
          </div>
        ) : (
          /* Observation list */
          <div className="divide-y divide-slate-100">
            {recentObs.map((obs) => (
              <button
                key={obs.id}
                onClick={() => handleViewObservation(obs.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-amber-50/40 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {obs.resident_name || t('caregiver.observations_title')}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    {obs.observation_date}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
            {observations.length > 5 && (
              <div className="px-6 py-3.5 bg-slate-50">
                <button
                  onClick={() => navigate('/caregiver/observations/new')}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                >
                  {t('caregiver.obs_view_all', { count: observations.length })} →
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    )
  }

  return (
    <PageLayout
      title={t('caregiver.dashboard_title')}
      subtitle={getContextSubtitle()}
      user={{ ...user, profile }}
      hideSignOut={true}
    >
      <GuidedTutorial />
      <div data-tutorial="family-circle">
        <FamilyCircleSetup />
      </div>

      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="h-5 w-5 text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-green-800">{t('caregiver.payment_success')}</p>
        </div>
      )}

      {!planActive && <InactivePlanNotice className="mb-6" />}

      {/* Full observation view/detail when navigated to it */}
      {viewMode === 'view' && currentObservationId ? (
        <ViewObservation
          observationId={currentObservationId}
          onBack={() => { setCurrentObservationId(null); setViewMode('list'); }}
          onExport={handleExportObservation}
          onDelete={async (id) => { await handleDeleteObservation(id); setCurrentObservationId(null); setViewMode('list'); }}
          isExporting={exportingFor === currentObservationId}
          isDeleting={deletingId === currentObservationId}
        />
      ) : isPaid ? (
        /* ── Paid user layout ── */
        <div className="space-y-5">
          {/* Resident strip — minimal ID anchor at top */}
          <DashboardResidentPanel />

          {/* Observations — visual hero, daily/weekly use */}
          {renderObservationsSection()}

          {/* Secondary tools: Care Plan + Memory Book */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div data-tutorial="care-plan-panel"><DashboardCarePlanPanel /></div>
            <div data-tutorial="memory-book-panel"><DashboardMemoryBookPanel /></div>
          </div>

          {/* How the tools work together */}
          <HowToolsWorkPanel t={t} />
        </div>
      ) : (
        /* ── Community Member (free) layout ── */
        <div className="space-y-6">

          {/* Observations — fully functional */}
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  {t('caregiver.observations_title')}
                </h2>
                {soloRemaining !== null && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {soloRemaining === 1
                      ? t('caregiver.free_obs_remaining_one')
                      : t('caregiver.free_obs_remaining_other').replace('{{count}}', String(soloRemaining))}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGuestInvite(true)}
                  className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-300 hover:bg-cyan-100 hover:border-cyan-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  {t('guest_invite.button_label')}
                </button>
                <Button variant="primary" size="sm" onClick={() => navigate('/caregiver/observations/new')} className="flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  {t('caregiver.new_obs_btn')}
                </Button>
              </div>
            </div>
            <ObservationList
              onViewObservation={handleViewObservation}
              onExportObservation={handleExportObservation}
              onDeleteObservation={handleDeleteObservation}
              deletingId={deletingId}
            />
          </section>

          {/* Locked panels — tease paid features */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              {t('caregiver.subscriber_tools_heading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Resident Profile — locked */}
              <Link to="/pricing" className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 focus:outline-none">
                <div className="p-5 opacity-30 pointer-events-none select-none" aria-hidden="true">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{t('dashboard.resident_title')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-2/3" />
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600">{t('caregiver.locked_panel_cta')}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Memory Book — locked */}
              <Link to="/pricing" className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-teal-300 hover:shadow-md transition-all duration-200 focus:outline-none">
                <div className="p-5 opacity-30 pointer-events-none select-none" aria-hidden="true">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-teal-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{t('dashboard.mb_title')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-teal-50 rounded-full w-4/5" />
                    <div className="h-2.5 bg-teal-50 rounded-full w-3/5" />
                    <div className="h-2.5 bg-teal-50 rounded-full w-2/3" />
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{t('caregiver.upsell_mb_desc')}</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-teal-200 rounded-full px-3 py-1.5 shadow-sm">
                    <Lock className="w-3 h-3 text-teal-500" />
                    <span className="text-xs font-semibold text-teal-700">{t('caregiver.locked_panel_cta')}</span>
                    <ArrowRight className="w-3 h-3 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Care Plan — locked */}
              <Link to="/pricing" className="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none">
                <div className="p-5 opacity-30 pointer-events-none select-none" aria-hidden="true">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{t('care_plan.title')}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-blue-50 rounded-full w-full" />
                    <div className="h-2.5 bg-blue-50 rounded-full w-4/5" />
                    <div className="h-2.5 bg-blue-50 rounded-full w-3/5" />
                  </div>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{t('caregiver.upsell_cp_desc')}</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full px-3 py-1.5 shadow-sm">
                    <Lock className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-semibold text-blue-700">{t('caregiver.locked_panel_cta')}</span>
                    <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>

            </div>
          </section>
        </div>
      )}
      {showGuestInvite && (
        <GuestInviteModal
          residentOptions={residentOptions}
          onClose={() => setShowGuestInvite(false)}
        />
      )}
    </PageLayout>
  );
}
