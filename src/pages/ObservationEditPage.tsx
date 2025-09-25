// src/pages/ObservationEditPage.tsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import ObservationForm from '../components/caregiver/ObservationForm'
import { useObservationById } from '../hooks/useObservations'

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export default function ObservationEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, loading, error } = useAuth()

  // Guard early on params
  if (!id) {
    return <ErrorMessage message="Missing observation id in URL." />
  }

  // Auth guards
  if (loading) return <Loading message="Loading observation…" />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  // Load observation via existing hook (RLS enforced)
  const {
    data: obs,
    isLoading,
    error: obsError,
  } = useObservationById(id)

  if (isLoading) return <Loading message="Fetching observation…" />
  if (obsError) return <ErrorMessage message={`Error loading observation: ${String((obsError as any)?.message || obsError)}`} />
  if (!obs) return <ErrorMessage message="Observation not found." />

  const formType = (obs.form_type || '') as FormType
  if (!formType || !['ADL', 'IADL', 'COMPREHENSIVE'].includes(formType)) {
    return <ErrorMessage message={`Observation has invalid form type: "${String(formType)}"`} />
  }

  return (
    <Layout
      title="Edit Observation"
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <button
          type="button"
          className="underline"
          onClick={() => navigate('/caregiver')}
        >
          Back to Dashboard
        </button>
      }
    >
      {/* Small sanity readout helps if anything goes wrong */}
      <div className="mb-4 text-sm text-slate-600">
        <div><strong>ID:</strong> {obs.id}</div>
        <div><strong>Form:</strong> {formType}</div>
      </div>

      <ObservationForm
        observationId={obs.id}
        formType={formType}
        onComplete={() => navigate('/caregiver', { replace: true })}
      />
    </Layout>
  )
}
