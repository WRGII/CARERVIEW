import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, ClipboardList, Activity, LayoutGrid, ArrowRight, Clock } from 'lucide-react';

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
import { prefetchObservationFormAssets } from '../lib/prefetching';
import FamilyCircleSetup from '../components/caregiver/FamilyCircleSetup';
import MedicalSummaryCard from '../components/caregiver/MedicalSummaryCard';
import CarePlanStatusPanel from '../components/caregiver/CarePlanStatusPanel';
import { useDeleteObservation, useObservations } from '../hooks/useObservations';
import { useToast } from '../components/ui/ToastProvider';
import { localeToIntl } from '../lib/utils';
import { getLastModule, type LastModule } from '../lib/lastModule';
import { ObservationList } from '../components/caregiver/ObservationList';
import { ViewObservation } from '../components/caregiver/ViewObservation';

type ViewMode = 'list' | 'view';
type ExportFormat = 'docx' | 'csv';

function QuickActionCard({
  to,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  ctaLabel,
  mobileOnly,
}: {
  to: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  mobileOnly?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 ${mobileOnly ? 'md:hidden' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      <div className={`inline-flex items-center gap-1 text-xs font-semibold ${iconColor} group-hover:gap-2 transition-all`}>
        {ctaLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
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
    if (!isPaid) return 'Track care, log observations, and access community resources.';
    if (lastModule === 'care_plan') return 'You were last in Care Plan \u2014 here is your current progress.';
    if (lastModule === 'memory_book') return 'You were last in Memory Book \u2014 medical context is shown below.';
    if (lastModule === 'observations') return 'You were last adding an observation \u2014 recent logs are shown below.';
    return 'Here is a summary of your current care activities.';
  }

  function renderPrimaryFocus() {
    // Free users: always show the full observation list
    if (!isPaid) {
      return (
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
      );
    }

    if (lastModule === 'observations') {
      return (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">{t('caregiver.observations_title')}</h2>
            <Button variant="primary" size="sm" onClick={() => navigate('/caregiver/observations/new')} className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              {t('caregiver.new_obs_btn')}
            </Button>
          </div>
          {observations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No observations recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {(observations as any[]).slice(0, 5).map((obs) => (
                <button
                  key={obs.id}
                  onClick={() => handleViewObservation(obs.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
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
              {observations.length > 5 && (
                <div className="px-5 py-3">
                  <Link to="/caregiver/observations/new" className="text-xs font-semibold text-cyan-600 hover:text-cyan-800">
                    View all observations →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      );
    }

    if (lastModule === 'memory_book') {
      return (
        <section className="space-y-4">
          <MedicalSummaryCard />
          <CarePlanStatusPanel />
        </section>
      );
    }

    // Default (care_plan or null): Care Plan first
    return (
      <section className="space-y-4">
        <CarePlanStatusPanel />
        <MedicalSummaryCard />
      </section>
    );
  }

  return (
    <PageLayout
      title={t('caregiver.dashboard_title')}
      subtitle={getContextSubtitle()}
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        isPaid ? (
          <Button
            variant="primary"
            onClick={() => navigate('/caregiver/observations/new')}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('caregiver.new_obs_btn')}</span>
          </Button>
        ) : undefined
      }
    >
      <FamilyCircleSetup />

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
      ) : (
        <div className="space-y-8">
          {renderPrimaryFocus()}

          {/* Quick access cards — visible for paid users */}
          {isPaid && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quick access</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <QuickActionCard
                  to="/caregiver/memory-schedule"
                  icon={BookOpen}
                  iconColor="text-teal-700"
                  iconBg="bg-teal-50"
                  title="Memory Book"
                  subtitle="Preferences, health, providers"
                  ctaLabel="Open"
                />
                <QuickActionCard
                  to="/care-hub/care-plan"
                  icon={ClipboardList}
                  iconColor="text-blue-700"
                  iconBg="bg-blue-50"
                  title="Care Plan"
                  subtitle="Roles, authority, sustainability"
                  ctaLabel="Open"
                />
                <QuickActionCard
                  to="/caregiver/observations/new"
                  icon={Activity}
                  iconColor="text-amber-700"
                  iconBg="bg-amber-50"
                  title="Observations"
                  subtitle="Log functional status over time"
                  ctaLabel="New observation"
                />
                {/* Care Hub — mobile only (side nav handles it on md+) */}
                <QuickActionCard
                  to="/care-hub"
                  icon={LayoutGrid}
                  iconColor="text-slate-700"
                  iconBg="bg-slate-100"
                  title="Care Hub"
                  subtitle="All subscriber tools"
                  ctaLabel="Open"
                  mobileOnly
                />
              </div>
            </section>
          )}
        </div>
      )}
    </PageLayout>
  );
}
