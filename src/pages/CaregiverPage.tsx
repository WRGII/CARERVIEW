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

  const handleExportObservation = async (id: string, _format: 'docx' | 'csv') => {
    // hook up exports later
    console.log('Export', id)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'form':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setViewMode('list')} className="flex items-center space-x-2">
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
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setViewMode('list')} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
              </Button>
              <h2 className="text-xl font-semibold text-slate-900">View Observation</h2>
            </div>
            {currentObservationId && (
              <div className="bg-white border rounded-xl p-6">
                <p className="text-slate-600">Viewing observation {currentObservationId}</p>
                <p className="text-sm text-slate-500 mt-2">View functionality will be implemented in a future update.</p>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Your Observations</h2>
              <Button variant="primary" onClick={() => setViewMode('form')} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Observation</span>
              </Button>
            </div>
            <ObservationList onViewObservation={handleViewObservation} onExportObservation={handleExportObservation} />
          </div>
        )
    }
  }

  return (
    // pass both user + profile to Layout
    <Layout title="Caregiver Dashboard" user={{ ...user, profile }}>
      {renderContent()}
    </Layout>
  )
}
