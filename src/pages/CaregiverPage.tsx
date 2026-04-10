// src/pages/CaregiverPage.tsx
import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { localeToIntl } from '../lib/utils';
import { PageLayout } from '../components/layout/PageLayout';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Button } from '../components/ui/Button';
import { ObservationList } from '../components/caregiver/ObservationList';
import { ViewObservation } from '../components/caregiver/ViewObservation';
import { supabase } from '../lib/supabaseClient';
import { exportToDOCX, exportToCSV } from '../lib/exports';
import InactivePlanNotice from '../components/caregiver/InactivePlanNotice';
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan';
import { ScoreLegendDisplay } from '../components/caregiver/ScoreLegendDisplay';
import { prefetchObservationFormAssets } from '../lib/prefetching';
import FamilyCircleSetup from '../components/caregiver/FamilyCircleSetup';
import { useDeleteObservation } from '../hooks/useObservations';
import { useToast } from '../components/ui/ToastProvider';

type ViewMode = 'list' | 'view';
type ExportFormat = 'docx' | 'csv';

export default function CaregiverPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { user, profile, loading, error } = useAuth();
  const { data: plan } = useUserPlan();
  const planActive = hasActivePlan(plan);
  const { showToast } = useToast();
  const deleteObservationMutation = useDeleteObservation();
  const { t, locale } = useLocale();
  const intlLocale = localeToIntl(locale);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null);
  const [exportingFor, setExportingFor] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  React.useEffect(() => {
    if (user?.id) {
      prefetchObservationFormAssets(queryClient, user.id).catch((err) => {
        console.warn('Failed to prefetch observation form assets:', err);
      });
    }
  }, [user?.id, queryClient]);

  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      newUrl.searchParams.delete('plan');
      window.history.replaceState({}, '', newUrl.toString());
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Auth guards
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
      console.error('Delete failed:', e);
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
          id, user_id, patient_name, observation_date, notes, caregiver_name, caregiver_email, created_at, updated_at,
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

      const responses = (obs.responses ?? []).map(r => {
        const q = Array.isArray(r.question) ? r.question[0] : r.question;
        const c = q?.category ? (Array.isArray(q.category) ? q.category[0] : q.category) : null;
        return {
          question: q ? {
            id: q.id,
            question_text: q.question_text,
            sort_order: q.sort_order,
            category: c
          } : null
        };
      });

      const catMap = new Map<
        string,
        {
          id: string;
          name: string;
          type: 'ADL' | 'IADL';
          questions: { id: string; category_id: string; question_text: string; sort_order: number }[];
        }
      >();

      for (const r of responses) {
        const q = r?.question;
        const c = q?.category;
        if (!q || !c) continue;
        if (!catMap.has(c.id)) {
          catMap.set(c.id, { id: c.id, name: c.name, type: c.type, questions: [] });
        }
        catMap.get(c.id)!.questions.push({
          id: q.id,
          category_id: c.id,
          question_text: q.question_text,
          sort_order: q.sort_order,
        });
      }

      const categories = Array.from(catMap.values());
      categories.forEach((cat) => cat.questions.sort((a, b) => a.sort_order - b.sort_order));
      categories.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type)
      );

      if (format === 'docx') {
        await exportToDOCX(obs as any, categories as any, legend as any, t, intlLocale);
      } else {
        await exportToCSV(obs as any, categories as any, legend as any, t, intlLocale);
      }
    } catch (e: any) {
      console.error('Export failed:', e);
      alert(e?.message || 'Failed to export observation.');
    } finally {
      setExportingFor(null);
    }
  }

  async function handleExportFromView(observationId: string, format: ExportFormat) {
    await handleExportObservation(observationId, format);
  }

  async function handleDeleteFromView(observationId: string) {
    await handleDeleteObservation(observationId);
    setCurrentObservationId(null);
    setViewMode('list');
  }

  function renderBody() {
    if (viewMode === 'view') {
      return currentObservationId ? (
        <ViewObservation
          observationId={currentObservationId}
          onBack={() => {
            setCurrentObservationId(null);
            setViewMode('list');
          }}
          onExport={handleExportFromView}
          onDelete={handleDeleteFromView}
          isExporting={exportingFor === currentObservationId}
          isDeleting={deletingId === currentObservationId}
        />
      ) : (
        <div className="bg-white border rounded-xl p-6">
          <p className="text-slate-600">{t('caregiver.no_obs_selected')}</p>
        </div>
      );
    }
    return (
      <ObservationList
        onViewObservation={handleViewObservation}
        onExportObservation={handleExportObservation}
        onDeleteObservation={handleDeleteObservation}
        deletingId={deletingId}
      />
    );
  }

  return (
    <PageLayout
      title={t('caregiver.dashboard_title')}
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <Button
          variant="primary"
          onClick={() => navigate('/caregiver/observations/new')}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('caregiver.new_obs_btn')}</span>
        </Button>
      }
    >
      {/* Show Family setup card when on Family plan with no team */}
      <FamilyCircleSetup />

      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800">
              {t('caregiver.payment_success')}
            </p>
          </div>
        </div>
      )}

      {!planActive && <InactivePlanNotice className="mb-6" />}

      <div className="mb-8">
        <div className="bg-warm-white border border-slate-gray/20 rounded-xl shadow-sm overflow-hidden">
          <ScoreLegendDisplay compact={true} />
        </div>
      </div>

      <div className="mb-8">
        <Link
          to="/caregiver/dementia-scale"
          className="group flex items-center justify-between rounded-xl border border-cyan-primary/30 bg-white px-5 py-4 shadow-sm hover:border-cyan-primary/60 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-primary/10 flex items-center justify-center group-hover:bg-cyan-primary/20 transition-colors">
              <BookOpen className="w-5 h-5 text-cyan-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('caregiver.dementia_ref_title')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('caregiver.dementia_ref_body')}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-cyan-primary group-hover:translate-x-0.5 transition-transform">
            {t('common.view_arrow')}
          </span>
        </Link>
      </div>

      <div className="space-y-6">
        {viewMode === 'list' && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">{t('caregiver.observations_title')}</h2>
              <p className="text-slate-600">{t('caregiver.observations_body')}</p>
            </div>
          </div>
        )}
        {renderBody()}
      </div>
    </PageLayout>
  );
}
