// src/pages/ObservationEditPage.tsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import ObservationForm from '../components/caregiver/ObservationForm'

type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export default function ObservationEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, loading, error } = useAuth()
  const [obs, setObs] = React.useState<{
    id: string
    user_id: string
    form_type: FormType
    observation_date: string | null
    patient_name: string | null
    notes: string | null
    caregiver_name: string | null
    caregiver_email: string | null
  } | null>(null)
  const [loadErr, setLoadErr] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(true)

  // Auth guards
  if (loading) return <Loading message="Loading observation…" />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!id) throw new Error('Missing observation id')
        const { data, error: selErr } = await supabase
          .from('observations')
          .select('id,user_id,form_type,observation_date,patient_name,notes,caregiver_name,caregiver_email')
          .eq('id', id)
          .single()
        if (selErr) throw new Error(selErr.message)
        if (!cancelled) {
          // Simple owner guard (RLS should already enforce)
          if (data.user_id !== user.id) throw new Error('Not authorized to view this observation.')
          setObs(data as any)
        }
      } catch (e: any) {
        if (!cancelled) setLoadErr(e?.message || String(e))
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => { cancelled = true }
  }, [id, user.id])

  if (busy) return <Loading message="Loading observation…" />
  if (loadErr) return <ErrorMessage message={loadErr} />
  if (!obs) return <ErrorMessage message="Observation not found." />

  return (
    <Layout
      title="Edit Observation"
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={<button className="underline" onClick={() => navigate('/caregiver')}>Back to Dashboard</button>}
    >
      <ObservationForm
        observationId={obs.id}
        formType={obs.form_type}
        onComplete={() => navigate('/caregiver', { replace: true })}
      />
    </Layout>
  )
}
