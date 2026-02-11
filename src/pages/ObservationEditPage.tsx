// src/pages/ObservationEditPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageLayout } from "../components/layout/PageLayout";
import { Loading } from "../components/ui/Loading";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import ObservationForm from "../components/caregiver/ObservationForm";
import { useObservationById } from "../hooks/useObservations";
import { ErrorBoundary } from "../components/util/ErrorBoundary";
import { useMemberFrozen } from "../hooks/useMemberFrozen";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { Button } from "../components/ui/Button";

type FormType = "ADL" | "IADL" | "COMPREHENSIVE";

export default function ObservationEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { user, profile, loading: authLoading, error: authError } = useAuth();
  const { data: obs, isLoading: obsLoading, error: obsError } = useObservationById(id);
  const frozen = useMemberFrozen(obs?.team_id ?? null);

  if (!id) return <ErrorMessage message="Missing observation id in URL." />;

  if (authLoading) return <Loading message="Loading observation…" />;
  if (authError || !user) return <ErrorMessage message={authError || "Authentication required."} />;
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />;
  if (profile.disabled) return <ErrorMessage message="Account disabled." />;

  if (obsLoading) return <Loading message="Fetching observation…" />;
  if (obsError) return <ErrorMessage message={`Error loading observation: ${String((obsError as any)?.message || obsError)}`} />;
  if (!obs) return <ErrorMessage message="Observation not found." />;

  const formType = (obs.form_type || "") as FormType;
  const isValidType = formType === "ADL" || formType === "IADL" || formType === "COMPREHENSIVE";
  if (!isValidType) return <ErrorMessage message={`Observation has invalid form type: "${String(formType)}"`} />;

  const isAuthor = obs.author_user_id === user.id;
  const readOnly = !isAuthor || frozen;

  const formLabel = formType === 'COMPREHENSIVE' ? 'Comprehensive' : formType === 'ADL' ? 'Daily Living (ADL)' : 'Life Skills (IADL)';

  return (
    <PageLayout
      title=""
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <Button variant="outline" onClick={() => navigate("/caregiver")}>
          Back to Dashboard
        </Button>
      }
    >
      <Breadcrumbs items={[
        { label: 'Dashboard', to: '/caregiver' },
        { label: `${formLabel} Observation` },
      ]} />

      {!isAuthor && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          You're viewing someone else's observation. You can see the details but can't make changes.
        </div>
      )}
      {isAuthor && frozen && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          Your spot on the care team is paused. The Family Circle owner can fix this from their billing settings.
        </div>
      )}

      <ErrorBoundary
        fallback={
          <div className="rounded-md border border-peach-blush bg-peach-blush/20 p-4 text-slate-800">
            <div className="font-semibold mb-1">Couldn’t render the form.</div>
            <div className="text-sm">Please refresh the page. If the error persists, there may be an issue in ObservationForm or its hooks.</div>
          </div>
        }
      >
        <ObservationForm
          observationId={obs.id}
          formType={formType}
          onComplete={() => navigate("/caregiver", { replace: true })}
        />
      </ErrorBoundary>
    </PageLayout>
  );
}
