import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateObservation } from '../hooks/useObservations'
import { useCategories } from '../hooks/useCategories'
import { useLegend } from '../hooks/useLegend'
import { exportToDOCX, exportToCSV } from '../lib/exports'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { ObservationList } from '../components/caregiver/ObservationList'
import { ObservationForm } from '../components/caregiver/ObservationForm'
import { Plus, ArrowLeft } from 'lucide-react'

type ViewMode = 'list' | 'form' | 'view'

export const CaregiverPage: React.FC = () => {
  const { token, loading, error } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)
  const [newPatientName, setNewPatientName] = useState('')
  const [newObservationNotes, setNewObservationNotes] = useState('')

  const createObservation = useCreateObservation()
  const { data: categories } = useCategories()
  const { data: legend } = useLegend()

  if (loading) {
    return <Loading message="Validating access..." />
  }

  if (error || !token || token.role !== 'caregiver') {
    return <ErrorMessage message={error || 'Access denied. Invalid caregiver token.'} />
  }

  const handleCreateObservation = async () => {
    const tokenId = token?.tokenId
    if (!tokenId) return

    try {
      const observation = await createObservation.mutateAsync({
        token_id: tokenId,
        patient_name: newPatientName.trim(),
        observation_date: new Date().toISOString().split('T')[0],
        notes: newObservationNotes.trim()
      })

      setCurrentObservationId(observation.id)
      setViewMode('form')
      setNewPatientName('')
      setNewObservationNotes('')
    } catch (err) {
      console.error('Failed to create observation:', err)
    }
  }

  const handleViewObservation = (id: string) => {
    setCurrentObservationId(id)
    setViewMode('view')
  }

  const handleExportObservation = async (id: string, format: 'docx' | 'csv') => {
    if (!categories || !legend) return

    try {
      // In a real implementation, you'd fetch the full observation with responses
      // For now, we'll create a mock observation structure
      const mockObservation = {
        id,
        patient_name: 'Sample Patient',
        observation_date: new Date().toISOString().split('T')[0],
        notes: 'Sample observation notes',
        responses: [] // This would be populated with actual response data
      }

      if (format === 'docx') {
        await exportToDOCX(mockObservation as any, categories, legend)
      } else if (format === 'csv') {
        await exportToCSV(mockObservation as any, categories, legend)
      }
    } catch (error) {
      console.error(`Failed to export observation as ${format.toUpperCase()}:`, error)
      alert(`Failed to export observation. Please try again.`)
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
            {!currentObservationId ? (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-900">Create New Observation</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      label="Patient Name (Optional)"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="Enter patient name or identifier"
                    />
                    <Input
                      label="Notes (Optional)"
                      value={newObservationNotes}
                      onChange={(e) => setNewObservationNotes(e.target.value)}
                      placeholder="Add any initial notes about this observation"
                    />
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        onClick={handleCreateObservation}
                        disabled={createObservation.isPending}
                      >
                        Create Observation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setViewMode('list')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ObservationForm observationId={currentObservationId} />
            )}
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
            <ObservationForm 
              observationId={currentObservationId}
              // In a real implementation, you'd pass existing responses here
            />
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Your Observations</h2>
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentObservationId(null)
                  setViewMode('form')
                }}
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
    <Layout title="Caregiver Dashboard" role="caregiver">
      {renderContent()}
    </Layout>
  )
}