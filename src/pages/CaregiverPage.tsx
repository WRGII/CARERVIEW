import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Activity, ArrowRight, Clock, BookOpen, ClipboardList } from 'lucide-react';
import GuidedTutorial from '../components/caregiver/GuidedTutorial';

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

  useEffect(() => {
    setLastModule(getLastModule());
  }, []);

  useEffect(() => {
    if (user?.id) {
      prefetchObservationFormAssets(queryClient, user.id).catch((err) => {
        console.warn('Failed to prefetch observation form assets:', err);
      });
    }
  }, [user?.id, queryClient]);

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

  // ── Observations section (used in paid layout) ─────────────────────────────

  function renderObservationsSection() {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              {t('caregiver.observations_title')}
            </h2>
            <p className="text-xs font-semibold text-amber-700 mt-0.5">{t('care_hub.mental_model_obs_tag')}</p>
          </div>
          <Button data-tutorial="new-observation" variant="primary" size="sm" onClick={() => navigate('/caregiver/observations/new')} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            {t('caregiver.new_obs_btn')}
          </Button>
        </div>

        {observations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <Activity className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">{t('caregiver.obs_empty')}</p>
            <button
              onClick={() => navigate('/caregiver/observations/new')}
              className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
            >
              {t('caregiver.obs_empty_cta')}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {(observations as any[]).slice(0, 4).map((obs) => (
              <button
                key={obs.id}
                onClick={() => handleViewObservation(obs.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{obs.resident_name || 'Observation'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {obs.observation_date}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
            {observations.length > 4 && (
              <div className="px-5 py-3">
                <Link to="/caregiver/observations/new" className="text-xs font-semibold text-amber-600 hover:text-amber-800">
                  {t('caregiver.obs_view_all', { count: observations.length })}
                </Link>
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
          {/* Resident panel — full width, foundational context */}
          <DashboardResidentPanel />

          {/* Top row: Care Plan + Memory Book side by side on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div data-tutorial="care-plan-panel"><DashboardCarePlanPanel /></div>
            <div data-tutorial="memory-book-panel"><DashboardMemoryBookPanel /></div>
          </div>

          {/* Observations section */}
          {renderObservationsSection()}

          {/* How the tools work together */}
          <HowToolsWorkPanel t={t} />
        </div>
      ) : (
        /* ── Free user layout ── */
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{t('caregiver.observations_title')}</h2>
              <Button variant="primary" size="sm" onClick={() => navigate('/caregiver/observations/new')} className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                {t('caregiver.new_obs_btn')}
              </Button>
            </div>
            <ObservationList
              onViewObservation={handleViewObservation}
              onExportObservation={handleExportObservation}
              onDeleteObservation={handleDeleteObservation}
              deletingId={deletingId}
            />
          </section>

          {/* Upsell quick access for free users */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{t('caregiver.subscriber_tools_heading')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/pricing"
                className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t('dashboard.mb_title')}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('caregiver.upsell_mb_desc')}</p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:gap-2 transition-all">
                  {t('caregiver.upsell_upgrade_cta')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
              <Link
                to="/pricing"
                className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t('care_plan.title')}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t('caregiver.upsell_cp_desc')}</p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:gap-2 transition-all">
                  {t('caregiver.upsell_upgrade_cta')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </section>
        </div>
      )}
    </PageLayout>
  );
}
