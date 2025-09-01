// src/pages/CaregiverPage.tsx
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ObservationList } from '../components/caregiver/ObservationList'
import ObservationForm from '../components/caregiver/ObservationForm'
import { ViewObservation } from '../components/caregiver/ViewObservation'
import { Plus, ArrowLeft } from 'lucide-react'

// ✅ use relative paths instead of "@/..."
import { supabase } from '../lib/supabaseClient'
import { exportToDOCX, exportToCSV } from '../lib/exports'

type ViewMode = 'list' | 'form' | 'view'

export default function CaregiverPage() {
  const { user, profile, loading, error } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)

  if (loading) return <Loading message="Loading caregiver dashboard..." />
  if (error || !user) return <ErrorMessage message={error || 'Authentication required.'} />
  if (!profile) return <ErrorMessage message="Profile not found. Please contact support." />
  if (profile.disabled) return <ErrorMessage message="Account disabled." />

  const handleViewObservation = (id: string) => {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  const handleExportObservation = async (observationId: string, format: 'docx' | 'csv') => {
    try {
      // 1) Fetch observation + nested responses + joins
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

      // 2) Fetch legend
      const { data: legend, error: legErr } = await supabase
        .from('legend')
        .select('*')
        .order('score', { ascending: true })

      if (legErr) throw new Error(`Failed to load legend: ${legErr.message}`)

      // 3) Build categories-with-questions
      const responses = (obs?.responses ?? []) as Array<{
        question: {
          id: string
          question_text: string
          sort_order: number
          category: { id: string; name: string; type: 'ADL' | 'IADL' }
        }
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
        const c = r.question.category
        if (!c) continue
        if (!catMap.has(c.id)) {
          catMap.set(c.id, { id: c.id, name: c.name, type: c.type, questions: [] })
        }
        catMap.get(c.id)!.questions.push({
          id: r.question.id,
          category_id: c.id,
          question_text: r.question.question_text,
          sort_order: r.question.sort_order,
        })
      }

      const categories = Array.from(catMap.values())
      categories.forEach(cat => cat.questions.sort((a, b) => a.sort_order - b.sort_order))
      categories.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type.localeCompare(b.type)
      )

      // 4) Trigger the correct exporter
      if (format === 'docx') {
        await exportToDOCX(obs as any, categories as any, legend as any)
      } else {
        await exportToCSV(obs as any, categories as any, legend as any)
      }
    } catch (e: any) {
      console.error('Export failed:', e)
      alert(e?.message || 'Failed to export observation.')
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
            <ObservationForm onComplete={() => setViewMode('list')} />
          </div>
        )
      case 'view':
        return (
          currentObservationId ? (
            <ViewObservation
              observationId={currentObservationId}
              onBack={() => setViewMode('list')}
            />
          ) : (
            <div className="bg-white border rounded-xl p-6">
              <p className="text-slate-600">No observation selected</p>
            </div>
          )
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
    <Layout title="Caregiver Dashboard" user={{ ...user, profile }}>
      {renderContent()}
    </Layout>
  )
}
