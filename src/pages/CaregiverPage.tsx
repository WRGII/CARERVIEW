// src/pages/CaregiverPage.tsx
import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ObservationList } from '../components/caregiver/ObservationList'
import ObservationForm from '../components/caregiver/ObservationForm'
import { Plus, ArrowLeft } from 'lucide-react'

type ViewMode = 'list' | 'form' | 'view'

export default function CaregiverPage() {
  const { loading, error, user, profile } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)

  // Guards
  if (loading) return <Loading message="Loading caregiver dashboard..." />
  if (error) return <ErrorMessage message={error} />
  if (!user || !profile) return <ErrorMessage message="Authentication required." />
  if (profile.role !== 'caregiver') return <ErrorMessage message="Caregiver access required." />
  if (profile.disabled) return <ErrorMessage message="Account disabled. Please contact admin." />

  const handleViewObservation = (id: string) => {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  const handleExportObservation = async (id: string, format: 'docx' | 'csv') => {
    // Hook up to your export functions when ready
    console.log(`Exporting observation ${id} as ${format}`)
  }

  return (
    <Layout title="Caregiver Dashboard">
      {viewMode === 'form' ? (
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
          {/* ObservationForm should redirect to /caregiver after save */}
          <ObservationForm />
        </div>
      ) : viewMode === 'view' ? (
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
              <p className="text-sm text-slate-500 mt-2">Detailed view coming soon.</p>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </Layout>
  )
}
