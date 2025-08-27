import React, { useState } from 'react'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCreateObservation, useObservation } from '../hooks/useObservations'
import { useCategories } from '../hooks/useCategories'
import { useLegend } from '../hooks/useLegend'
import { exportToDOCX, exportToCSV } from '../lib/exports'
import { supabase } from '../lib/supabase'
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
  const [contextSet, setContextSet] = useState(false)

  const createObservation = useCreateObservation()
  const { data: categories } = useCategories()
  const { data: legend } = useLegend()

  // Ensure session context is established for RLS
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          await establishSessionFromToken()
        } catch (err) {
          console.error('Failed to establish session context:', err)
        }
      })()
    }
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
    if (!categories || !legend) return
    
    console.log('Exporting observation:', id, 'in format:', format)

    try {
      // Fetch the complete observation with responses, questions, and categories
      const { data: observation, error: obsError } = await supabase
        .from('observations')
        .select('*')
        .eq('id', id)
        .single()

      if (obsError) {
        throw new Error(`Failed to fetch observation: ${obsError.message}`)
      }

      const { data: responses, error: resError } = await supabase
        .from('responses')
        .select(`
          *,
          question:questions(*,
            category:categories(*)
          )
        `)
        .eq('observation_id', id)

      if (resError) {
        throw new Error(`Failed to fetch responses: ${resError.message}`)
      }

      const observationWithResponses = {
        ...observation,
        responses: responses || []
      }

      console.log('Fetched observation for export:', observationWithResponses)

      if (format === 'docx') {
        await exportToDOCX(observationWithResponses as any, categories, legend)
      } else if (format === 'csv') {
        await exportToCSV(observationWithResponses as any, categories, legend)
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
              <Button
                variant="primary"
                onClick={() => {
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