// src/pages/CaregiverPage.tsx
import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ObservationList } from '../components/caregiver/ObservationList'
import { ViewObservation } from '../components/caregiver/ViewObservation'
import { Plus } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'
import { exportToDOCX, exportToCSV } from '../lib/exports'
import InactivePlanNotice from "../components/caregiver/InactivePlanNotice";

type ViewMode = 'list' | 'view'
type ExportFormat = 'docx' | 'csv'

export default function CaregiverPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, loading, error } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)
  const [exportingFor, setExportingFor] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Check for success parameter from Stripe redirect
  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      // Clear the URL parameters
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('success')
      newUrl.searchParams.delete('plan')
      window.history.replaceState({}, '', newUrl.toString())
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

  // Auth / profile guards
  if (loading) return <Loading message="Loading caregiver dashboard..." />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  function handleViewObservation(id: string) {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  async function handleExportObservation(observationId: string, format: ExportFormat) {
    if (exportingFor) return
    setExportingFor(observationId)
    try {
      // Observation + nested responses + joins
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
        .single()

      if (obsErr) throw new Error(`Failed to load observation: ${obsErr.message}`)
      if (!obs) throw new Error('Observation not found.')

      // Legend (1–5)
      const { data: legend, error: legErr } = await supabase
        .from('legend')
        .select('*')
        .order('score', { ascending: true })

      if (legErr) throw new Error(`Failed to load legend: ${legErr.message}`)

      // Build categories-with-questions (defensive against nulls)
      const responses = (obs.responses ?? []) as Array<{
        question: {
          id: string
          question_text: string
          sort_order: number
          category: { id: string; name: string; type: 'ADL' | 'IADL' } | null
        } | null
      }>

      const catMap = new Map<
        string,
        {
          id: string
          name: string
          type: 'ADL' | 'IADL'
          questions: { id: string; category_id: string; question_text: string; sort_order: number }[]
        }
      >()

      for (const r of responses) {
        const q = r?.question
        const c = q?.category
        if (!q || !c) continue
        if (!catMap.has(c.id)) {
          catMap.set(c.id, { id: c.id, name: c.name, type: c.type, questions: [] })
        }
        catMap.get(c.id)!.questions.push({
          id: q.id,
          category_id: c.id,
          question_text: q.question_text,
          sort_order: q.sort_order,
        })
      }

      const categories = Array.from(catMap.values())
      categories.forEach(cat => cat.questions.sort((a, b) => a.sort_order - b.sort_order))
      categories.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type)
      )

      if (format === 'docx') {
        await exportToDOCX(obs as any, categories as any, legend as any)
      } else {
        await exportToCSV(obs as any, categories as any, legend as any)
      }
    } catch (e: any) {
      console.error('Export failed:', e)
      alert(e?.message || 'Failed to export observation.')
    } finally {
      setExportingFor(null)
    }
  }

  function renderHeader() {
    switch (viewMode) {
      case 'view':
        // ViewObservation renders its own top bar (Back + Print)
        return null
      default:
        return (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Your Observations</h2>
            <Button
              variant="primary"
              onClick={() => navigate('/caregiver/observations/new')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Observation</span>
            </Button>
          </div>
        )
    }
  }

  function renderBody() {
    switch (viewMode) {
      case 'view':
        return currentObservationId ? (
          <ViewObservation
            observationId={currentObservationId}
            onBack={() => {
              setCurrentObservationId(null)
              setViewMode('list')
            }}
          />
        ) : (
          <div className="bg-white border rounded-xl p-6">
            <p className="text-slate-600">No observation selected</p>
          </div>
        )
      default:
        return (
          <ObservationList
            onViewObservation={handleViewObservation}
            onExportObservation={handleExportObservation}
          />
        )
    }
  }

  return (
    <Layout title="Caregiver Dashboard" user={{ ...user, profile }}>
      <div className="space-y-6">
        {/* Success message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Payment successful! Your subscription is now active.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="inline-flex text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {renderHeader()}
        {renderBody()}
      </div>
    </Layout>
  )
}
