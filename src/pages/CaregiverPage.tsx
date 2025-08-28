import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { exportToDOCX, exportToCSV } from '../lib/exports'
import { supabase } from '../lib/supabaseClient'
import { establishSessionFromToken } from '../lib/tokenSession'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ObservationList } from '../components/caregiver/ObservationList'
import ObservationForm from '../components/caregiver/ObservationForm'
import { Plus, ArrowLeft } from 'lucide-react'

type ViewMode = 'list' | 'form' | 'view'

export const CaregiverPage: React.FC = () => {
  const { token, loading, error } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)

  // Ensure session context is established for RLS once we have a token
  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        await establishSessionFromToken() // validates token + calls set_token_context
      } catch (err) {
        console.error('Failed to establish session context:', err)
      }
    })()
  }, [token])

  if (loading) {
    return <Loading message="Validating access..." />
  }

  if (error || !token || token.role !== 'caregiver') {
    return <ErrorMessage message={error || 'Access denied. Invalid caregiver token.'} />
  }

  const handleViewObservation = (id: string) => {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  const handleExportObservation = async (id: string, format: 'docx' | 'csv') => {
    try {
      // Fetch the observation
      const { data: observation, error: obsError } = await supabase
        .from('observations')
        .select('*')
        .eq('id', id)
        .single()
      if (obsError) throw new Error(`Failed to fetch observation: ${obsError.message}`)

      // Fetch responses with nested question + category
      const { data: responses, error: resError } = await supabase
        .from('responses')
        .select(`
          *,
          question:questions(*,
            category:categories(*)
          )
        `)
        .eq('observation_id', id)
      if (resError) throw new Error(`Failed to fetch responses: ${resError.message}`)

      const observationWithResponses = { ...observation, responses: responses || [] }

      // Build a minimal categories structure from responses for the exporters
      // (If your exporters expect a richer shape or legend, adjust here or fetch via a view.)
      const categoriesMap = new Map<string, { name: string; questions: { question_text: string; score?: number }[] }>()
      for (const r of observationWithResponses.responses as any[]) {
        const catId = r.question?.category?.id
        const catName = r.question?.category?.name
        const qText = r.question?.question_text
        const score = r.score
        if (!catId || !catName || !qText) continue
        if (!categoriesMap.has(catId)) {
          categoriesMap.set(catId, { name: catName, questions: [] })
        }
        categoriesMap.get(catId)!.questions.push({ question_text: qText, score })
      }
      const categories = Array.from(categoriesMap.values())

      // Legend: if your exporters require it but you don't use it for this export, pass {}
      const legend = {}

      if (format === 'docx') {
        await exportToDOCX({
          observation: observationWithResponses,
          categories,
          legend,
          orgName: 'CareView',
          filename: `CareView_Observation_${id}.docx`,
        })
      } else {
        await exportToCSV({
          observation: observationWithResponses,
          categories,
          legend,
          filename: `CareView_Observation_${id}.csv`,
        })
      }
    } catch (e: any) {
      console.error(`Failed to export observation as ${format.toUpperCase()}:`, e)
      alert(`Failed to export observation. ${e?.message || 'Please try again.'}`)
    }
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'form':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setViewMode('list')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">Recording Observation</h2>
            </div>
            <ObservationForm />
          </div>
        )

      case 'view':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setViewMode('list')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">View Observation</h2>
            </div>
            {currentObservationId && (
              <div className="bg-white border rounded-xl p-6">
                <p className="text-slate-600">Viewing observation {currentObservationId}</p>
                <p className="text-sm text-slate-500 mt-2">
                  View functionality will be implemented in a future update.
                </p>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Your Observations</h2>
              <Button
                variant="primary"
                onClick={() => setViewMode('form')}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Observation</span>
              </Button>
            </div>

            <ObservationList
              onViewObservation={handleViewObservation}
              onExportObservation={handleExportObservation}
            />
          </div>
        )
    }
  }

  return (
    <Layout title="Caregiver Dashboard" role="caregiver" tokenId={token.tokenId}>
      {renderContent()}
    </Layout>
  )
}
