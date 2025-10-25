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

  return (
    <PageLayout
      title="Edit Observation"
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <button type="button" className="underline" onClick={() => navigate("/caregiver")}>
          Back to Dashboard
        </button>
      }
    >
      <div className="mb-4 text-sm text-slate-600 space-y-1">
        <div><strong>ID:</strong> {obs.id}</div>
        <div><strong>Form:</strong> {formType}</div>
        {!isAuthor && <div className="text-amber-700">View only. You are not the author.</div>}
        {isAuthor && frozen && <div className="text-red-600">Seat frozen. You cannot edit until the owner restores your seat.</div>}
      </div>

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
          readOnly={readOnly}
          onComplete={() => navigate("/caregiver", { replace: true })}
        />
      </ErrorBoundary>
    </PageLayout>
  );
}
