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
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ADL Observation */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setChoice('ADL')}
                className="w-full text-left rounded-2xl border border-slate-200 bg-warm-white p-6 shadow-sm hover:shadow-md hover:border-cyan-primary/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-primary/15 flex items-center justify-center">
                    <ActivitySquare className="w-6 h-6 text-cyan-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">ADL Observation</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Activities of Daily Living
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Essential daily activities like bathing, dressing, eating, mobility, and safety awareness.
                </p>
              </button>

              {/* ADL Categories List */}
              {categoriesLoading ? (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-500">Loading categories...</div>
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">ADL Categories:</h4>
                  <div className="grid gap-2">
                    {adlCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200/50"
                      >
                        <div className="w-2 h-2 rounded-full bg-cyan-primary/60"></div>
                        <span>{category.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">({category.questions?.length || 0} questions)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IADL Observation */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setChoice('IADL')}
                className="w-full text-left rounded-2xl border border-slate-200 bg-warm-white p-6 shadow-sm hover:shadow-md hover:border-mint-green/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-mint-green/30 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">IADL Observation</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Instrumental Activities of Daily Living
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Complex daily tasks like managing medications, meals, housekeeping, finances, and communication.
                </p>
              </button>

              {/* IADL Categories List */}
              {categoriesLoading ? (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-500">Loading categories...</div>
                </div>
              ) : (
                <div className="bg-slate-50/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">IADL Categories:</h4>
                  <div className="grid gap-2">
                    {iadlCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 text-sm text-slate-600 bg-white rounded-lg px-3 py-2 border border-slate-200/50"
                      >
                        <div className="w-2 h-2 rounded-full bg-mint-green/60"></div>
                        <span>{category.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">({category.questions?.length || 0} questions)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Observation */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setChoice('COMPREHENSIVE')}
                className="w-full text-left rounded-2xl border border-slate-200 bg-warm-white p-6 shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-200 relative"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Recommended
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Comprehensive Observation</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Complete Assessment
                    </p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  ADL + IADL combined in one complete session for a full picture of daily functioning.
                </p>
              </button>

              {/* Comprehensive Note */}
              <div className="bg-gradient-to-r from-cyan-primary/5 to-mint-green/10 rounded-xl p-4 border border-cyan-primary/20">
                <div className="text-sm text-slate-700">
                  <div className="font-semibold mb-2">Complete Assessment includes:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-primary"></div>
                      <span>All {adlCategories.length} ADL categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-mint-green"></div>
                      <span>All {iadlCategories.length} IADL categories</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      <span className="font-medium">Total: {adlCategories.length + iadlCategories.length} categories</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CarerView 1-5 ADL Scale */}
          <div className="mt-12">
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-8 border border-slate-200/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 tracking-wide mb-4">
                  CARERVIEW 1-5 ADL SCALE
                </h2>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Our simple 1-5 scale helps you observe and communicate changes in daily living activities with clarity and consistency.
                </p>
              </div>

              {/* Horizontal Scale */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ThumbsDown className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex flex-1 max-w-4xl">
                  <div className="flex-1 bg-peach-blush min-h-[100px] rounded-l-lg flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold mb-1">1</span>
                    <span className="text-xs font-semibold text-center px-2 leading-tight">Total Assistance</span>
                  </div>
                  <div className="flex-1 bg-peach-blush/70 min-h-[100px] flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold mb-1">2</span>
                    <span className="text-xs font-semibold text-center px-2 leading-tight">Constant Shared Effort</span>
                  </div>
                  <div className="flex-1 bg-cyan-primary/40 min-h-[100px] flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold mb-1">3</span>
                    <span className="text-xs font-semibold text-center px-2 leading-tight">Independent with Support</span>
                  </div>
                  <div className="flex-1 bg-mint-green/70 min-h-[100px] flex flex-col items-center justify-center text-slate-gray">
                    <span className="text-2xl font-bold mb-1">4</span>
                    <span className="text-xs font-semibold text-center px-2 leading-tight">Independent with Difficulty</span>
                  </div>
                  <div className="flex-1 bg-mint-green min-h-[100px] rounded-r-lg flex flex-col items-center justify-center text-slate-gray">
                    <span className="text-2xl font-bold mb-1">5</span>
                    <span className="text-xs font-semibold text-center px-2 leading-tight">Fully Independent</span>
                  </div>
                </div>

                <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-slate-600 text-base">
                  From "Total Assistance" to "Fully Independent" — a clear framework for observing daily living activities
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center pt-6">
            <Button variant="outline" onClick={() => navigate('/caregiver')} size="lg">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  // form after choice
  return (
    <Layout 
      title={`New ${choice === 'COMPREHENSIVE' ? 'Comprehensive' : choice} Observation`} 
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setChoice(null)}>← Change type</Button>
          <Button variant="outline" onClick={() => navigate('/caregiver')}>Cancel</Button>
        </div>
      }
    >
      <ObservationForm formType={choice} onComplete={handleComplete} />
    </Layout>
  )
}