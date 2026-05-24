// src/pages/ObservationEditPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../i18n/LocaleContext";
import { PageLayout } from "../components/layout/PageLayout";
import { Loading } from "../components/ui/Loading";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import ObservationForm from "../components/caregiver/ObservationForm";
import { useObservationById } from "../hooks/useObservations";
import { ErrorBoundary } from "../components/util/ErrorBoundary";
import { useMemberFrozen } from "../hooks/useMemberFrozen";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { Button } from "../components/ui/Button";
import { useUserTeamsResidents } from "../hooks/useMemoryBook";

type FormType = "ADL" | "IADL" | "COMPREHENSIVE";

export default function ObservationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useLocale();

  const { user, profile, loading: authLoading, error: authError } = useAuth();
  const { data: obs, isLoading: obsLoading, error: obsError } = useObservationById(id);
  const frozen = useMemberFrozen(obs?.team_id ?? null);
  const { data: residentOptions = [] } = useUserTeamsResidents(user?.id);

  if (!id) return <ErrorMessage message={t('obs_edit.missing_id')} />;

  if (authLoading) return <Loading message={t('obs_edit.loading')} />;
  if (authError || !user) return <ErrorMessage message={authError || t('common.auth_required')} />;
  if (!profile) return <ErrorMessage message={t('common.profile_not_found')} />;
  if (profile.disabled) return <ErrorMessage message={t('common.account_disabled')} />;

  if (obsLoading) return <Loading message={t('obs_edit.fetching')} />;
  if (obsError) return <ErrorMessage message={`Error loading observation: ${String((obsError as any)?.message || obsError)}`} />;
  if (!obs) return <ErrorMessage message={t('caregiver.obs_not_found')} />;

  const formType = (obs.form_type || "") as FormType;
  const isValidType = formType === "ADL" || formType === "IADL" || formType === "COMPREHENSIVE";
  if (!isValidType) return <ErrorMessage message={`Observation has invalid form type: "${String(formType)}"`} />;

  const isAuthor = obs.author_user_id === user.id;
  const readOnly = !isAuthor || frozen;

  const formLabel = formType === 'COMPREHENSIVE' ? t('obs_edit.form_comprehensive') : formType === 'ADL' ? t('obs_edit.form_adl') : t('obs_edit.form_iadl');

  return (
    <PageLayout
      title=""
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <Button variant="outline" onClick={() => navigate("/caregiver")}>
          {t('common.back_dashboard')}
        </Button>
      }
    >
      <Breadcrumbs items={[
        { label: t('caregiver.dashboard_title'), to: '/caregiver' },
        { label: `${formLabel} ${t('obs_edit.observation_label')}` },
      ]} />

      {!isAuthor && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          {t('obs_edit.readonly_notice')}
        </div>
      )}
      {isAuthor && frozen && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {t('obs_edit.frozen_notice')}
        </div>
      )}

      <ErrorBoundary
        fallback={
          <div className="rounded-md border border-peach-blush bg-peach-blush/20 p-4 text-slate-800">
            <div className="font-semibold mb-1">{t('obs_edit.render_error')}</div>
            <div className="text-sm">{t('obs_edit.render_error_detail')}</div>
          </div>
        }
      >
        <ObservationForm
          observationId={obs.id}
          formType={formType}
          onComplete={() => navigate("/caregiver", { replace: true })}
          residentOptions={residentOptions}
          initialResidentName={obs.resident_name ?? undefined}
          initialDate={obs.observation_date
            ? (() => {
                const [y, m, d] = obs.observation_date.split('-');
                return `${m}/${d}/${y}`;
              })()
            : undefined}
          initialMode={obs.mode_of_observation as 'In Person' | 'Voice Call' | 'Video Call' | undefined}
          initialNotes={obs.notes ?? undefined}
        />
      </ErrorBoundary>
    </PageLayout>
  );
}
