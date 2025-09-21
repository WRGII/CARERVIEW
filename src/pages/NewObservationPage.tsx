// src/pages/NewObservationPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import ObservationForm from '../components/caregiver/ObservationForm'
import { Button } from '../components/ui/Button'
import { ClipboardList, Sparkles, Layers } from 'lucide-react'

type Choice = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export default function NewObservationPage() {
  const navigate = useNavigate()
  const { user, profile, loading, error } = useAuth()
  const [choice, setChoice] = React.useState<Choice | null>(null)

  // auth guards
  if (loading) return <Loading message="Preparing your new observation…" />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  const handleComplete = () => {
    navigate('/caregiver', { replace: true })
  }

  // chooser cards
  if (!choice) {
    return (
      <Layout title="New Observation" user={{ ...user, profile }}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Choose observation type</h2>
            <Button variant="outline" onClick={() => navigate('/caregiver')}>Back to Dashboard</Button>
          </div>

          <p className="text-slate-600">
            Pick what you want to focus on today. You can always add more later.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* ADL */}
            <button
              type="button"
              onClick={() => setChoice('ADL')}
              className="text-left rounded-2xl border border-slate-200 bg-warm-white p-5 shadow-sm hover:shadow-md hover:border-cyan-primary/50 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-primary/15 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-cyan-primary" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">ADL Observation</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Activities of Daily Living (bathing, dressing, eating, mobility, safety…)
              </p>
            </button>

            {/* IADL */}
            <button
              type="button"
              onClick={() => setChoice('IADL')}
              className="text-left rounded-2xl border border-slate-200 bg-warm-white p-5 shadow-sm hover:shadow-md hover:border-mint-green/50 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-mint-green/30 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">IADL Observation</h3>
              </div>
              <p className="text-slate-600 text-sm">
                Instrumental Activities (medications, meals, housekeeping, finances, communication…)
              </p>
            </button>

            {/* COMPREHENSIVE */}
            <button
              type="button"
              onClick={() => setChoice('COMPREHENSIVE')}
              className="text-left rounded-2xl border border-slate-200 bg-warm-white p-5 shadow-sm hover:shadow-md hover:border-slate-400 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Comprehensive Observation</h3>
              </div>
              <p className="text-slate-600 text-sm">
                ADL + IADL together in one complete session.
              </p>
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  // form after choice
  return (
    <Layout title={`New ${choice === 'COMPREHENSIVE' ? 'Comprehensive' : choice} Observation`} user={{ ...user, profile }}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => setChoice(null)}>← Change type</Button>
        <Button variant="outline" onClick={() => navigate('/caregiver')}>Cancel</Button>
      </div>
      <ObservationForm formType={choice} onComplete={handleComplete} />
    </Layout>
  )
}
