import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ObservationList } from '../components/caregiver/ObservationList'
import { ViewObservation } from '../components/caregiver/ViewObservation'
import { Plus } from 'lucide-react'

import { supabase } from '../lib/supabaseClient'
import { exportToDOCX, exportToCSV } from '../lib/exports'

import BillingPanel from '../components/caregiver/BillingPanel'
import InactivePlanNotice from '../components/caregiver/InactivePlanNotice'
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan'
import AccountMenu from '../components/caregiver/AccountMenu'
import { ScoreLegendDisplay } from '../components/caregiver/ScoreLegendDisplay'

type ViewMode = 'list' | 'view'
type ExportFormat = 'docx' | 'csv'

export default function CaregiverPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, profile, loading, error } = useAuth()
  const { data: plan } = useUserPlan()
  const planActive = hasActivePlan(plan)

  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)
  const [exportingFor, setExportingFor] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  React.useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('success')
      newUrl.searchParams.delete('plan')
      window.history.replaceState({}, '', newUrl.toString())
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [searchParams])

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

      const { data: legend, error: legErr } = await supabase
        .from('legend')
        .select('*')
        .order('score', { ascending: true })
      if (legErr) throw new Error(`Failed to load legend: ${legErr.message}`)

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

  // New combined header band (C replaces prior B)
  const CaregiverHeaderBand = (
    <div className="space-y-4">
      {/* top row: title, welcome, Manage Account */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-gray/60 text-xs mb-1">
            Caregiver Portal · CareView Primary Caregiver
          </div>
          <h2 className="text-2xl font-bold text-slate-gray">
            Caregiver Dashboard{' '}
            {profile?.display_name && (
              <span className="font-normal text-slate-gray/70">Welcome {profile.display_name}</span>
            )}
          </h2>
        </div>
        <AccountMenu />
      </div>

      {/* legend slab */}
      <div className="rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
        <div className="p-4 md:p-6">
          <ScoreLegendDisplay compact />
        </div>
      </div>
    </div>
  )

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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-gray">Your Observations</h3>
              <Button
                variant="primary"
                onClick={() => navigate('/caregiver/observations/new')}
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
    // hideSignOut => we removed the old “Sign Out” from the page header; it’s now in AccountMenu
    <Layout hideSignOut headerRight={null}>
      {/* optional ephemeral success after checkout */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-sm font-medium text-green-800">
            Payment successful! Your subscription is now active.
          </div>
        </div>
      )}

      {/* section C (new) – replaces the former caregiver header (B) */}
      {CaregiverHeaderBand}

      {/* plan nudges / billing blocks can stay below */}
      {!planActive && <InactivePlanNotice />}
      <BillingPanel />

      {renderBody()}
    </Layout>
  )
}
