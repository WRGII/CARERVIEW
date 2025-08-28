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

export const CaregiverPage: React.FC = () => {
  const { user, loading, error } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)

  if (loading) {
    return <Loading message="Loading caregiver dashboard..." />
  }

  if (error || !user) {
    return <ErrorMessage message={error || 'Authentication required.'} />
  }

  if (!user.profile) {
    return <ErrorMessage message="Profile not found. Please contact support." />
  }

  const handleViewObservation = (id: string) => {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  const handleExportObservation = async (id: string, format: 'docx' | 'csv') => {
    try {
      // Export functionality will be implemented separately
      console.log(`Exporting observation ${id} as ${format}`)
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
            <ObservationForm onComplete={() => setViewMode('list')} />
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
    <Layout title="Caregiver Dashboard" user={user}>
      {renderContent()}
    </Layout>
  )
}