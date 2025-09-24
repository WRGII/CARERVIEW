// src/pages/NewObservationPage.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import ObservationForm from '../components/caregiver/ObservationForm'
import { Button } from '../components/ui/Button'
import { ClipboardList, ActivitySquare, Layers, ThumbsDown, ThumbsUp } from 'lucide-react'
import { prefetchObservationFormAssets } from '../lib/prefetching'
import { ScoreLegendDisplay } from '../components/caregiver/ScoreLegendDisplay'

type Choice = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export default function NewObservationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, profile, loading, error } = useAuth()
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories()
  const [choice, setChoice] = React.useState<Choice | null>(null)

  // Prefetch observation form data when the component loads
  React.useEffect(() => {
    if (user?.id && !choice) {
      // Only prefetch when on the chooser screen (choice is null)
      prefetchObservationFormAssets(queryClient, user.id).catch((err) => {
        console.warn('Failed to prefetch observation form assets:', err)
      })
    }
  }, [user?.id, choice, queryClient])

  // auth guards
  if (loading) return <Loading message="Preparing your new observation…" />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  const handleComplete = () => {
    navigate('/caregiver', { replace: true })
  }

  // Filter categories by type and sort by sort_order
  const adlCategories = React.useMemo(() => {
    if (!categoriesData) return []
    return categoriesData
      .filter(cat => cat.type === 'ADL' && cat.name !== 'CATEGORY') // Filter out placeholder categories
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [categoriesData])

  const iadlCategories = React.useMemo(() => {
    if (!categoriesData) return []
    return categoriesData
      .filter(cat => cat.type === 'IADL' && cat.name !== 'CATEGORY') // Filter out placeholder categories
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [categoriesData])

  // chooser cards
  if (!choice) {
    return (
      <Layout title="New Observation" user={{ ...user, profile }}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Choose observation type</h2>
            <Button variant="outline" onClick={() => navigate('/caregiver')}>Back to Dashboard</Button>
          </div>

          <p className="text-slate-600">
            Pick what you want to focus on today. You can always add more later.
          </p>

          {/* Observation Type Cards with Category Lists */}
          {/* Simplified placeholder for debugging */}
          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <p className="text-slate-600 text-lg">Placeholder for observation type selection.</p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setChoice('ADL')}
                className="block w-full text-left p-4 border rounded-lg hover:bg-slate-50"
              >
                ADL Observation (Simple)
              </button>
              <button
                type="button"
                onClick={() => setChoice('IADL')}
                className="block w-full text-left p-4 border rounded-lg hover:bg-slate-50"
              >
                IADL Observation (Simple)
              </button>
              <button
                type="button"
                onClick={() => setChoice('COMPREHENSIVE')}
                className="block w-full text-left p-4 border rounded-lg hover:bg-slate-50"
              >
                Comprehensive Observation (Simple)
              </button>
            </div>
          </div>

  // form after choice
  return (
    <Layout 
  // form after choice
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setChoice(null)}>← Change type</Button>
          <Button variant="outline" onClick={() => navigate('/caregiver')}>Cancel</Button>
        </div>
      </Layout>
    )
  }
      }
    )
      <ObservationForm formType={choice} onComplete={handleComplete} />
    </Layout>
  )
}