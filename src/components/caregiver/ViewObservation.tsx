import React, { useState } from 'react'
import { useObservation } from '../../hooks/useObservations'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Loading } from '../ui/Loading'
import { ErrorMessage } from '../ui/ErrorMessage'
import { formatDate } from '../../lib/utils'
import { ArrowLeft, User, Calendar, Phone, FileText, Printer, Layers, Download, Trash2, File, Table } from 'lucide-react'
import { ScoreLegendDisplay } from './ScoreLegendDisplay'

type ExportFormat = 'docx' | 'csv'

interface ViewObservationProps {
  observationId: string
  onBack: () => void
  onExport: (observationId: string, format: ExportFormat) => void
  onDelete: (observationId: string) => void
  isExporting?: boolean
  isDeleting?: boolean
}

export const ViewObservation: React.FC<ViewObservationProps> = ({
  observationId,
  onBack,
  onExport,
  onDelete,
  isExporting = false,
  isDeleting = false
}) => {
  const { data: observation, isLoading, error } = useObservation(observationId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handlePrint = () => window.print()

  const handleDeleteClick = () => {
    setConfirmDelete(true)
  }

  const handleConfirmDelete = () => {
    onDelete(observationId)
    setConfirmDelete(false)
  }

  const handleCancelDelete = () => {
    setConfirmDelete(false)
  }

  if (isLoading) return <Loading message="Loading observation..." />
  if (error) return <ErrorMessage message={error.message || 'Failed to load observation'} />
  if (!observation) return <ErrorMessage message="Observation not found" />

  // ---- Group responses by category -----------------------------------------
  let categorizedResponses: Array<{
    id: string
    name: string
    type: 'ADL' | 'IADL'
    responses: Array<{
      score: number
      notes: string | null
      question: { question_text: string; sort_order: number }
    }>
  }> = []

  if (observation.responses) {
    const categoryMap = new Map<string, {
      id: string
      name: string
      type: 'ADL' | 'IADL'
      responses: Array<{
        score: number
        notes: string | null
        question: { question_text: string; sort_order: number }
      }>
    }>()

    observation.responses.forEach((response) => {
      const questionData = Array.isArray(response.question) ? response.question[0] : response.question
      const categoryData = questionData?.category ? (Array.isArray(questionData.category) ? questionData.category[0] : questionData.category) : null
      if (!categoryData || !questionData) return

      if (!categoryMap.has(categoryData.id)) {
        categoryMap.set(categoryData.id, {
          id: categoryData.id,
          name: categoryData.name,
          type: categoryData.type, // 'ADL' | 'IADL'
          responses: []
        })
      }

      categoryMap.get(categoryData.id)!.responses.push({
        score: response.score,
        notes: response.notes,
        question: {
          question_text: questionData.question_text,
          sort_order: questionData.sort_order
        }
      })
    })

    const categories = Array.from(categoryMap.values())

    // ADL categories first, then alphabetical by name
    categories.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'ADL' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    // Within each category, sort questions by the configured sort order
    categories.forEach((c) => {
      c.responses.sort((a, b) => a.question.sort_order - b.question.sort_order)
    })

    categorizedResponses = categories
  }

  const typeLabel =
    observation.form_type === 'COMPREHENSIVE'
      ? 'Comprehensive (ADL + IADL)'
      : observation.form_type || '—'

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to List</span>
          </Button>
          <h2 className="text-xl font-semibold text-slate-900">View Observation</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint} disabled={isExporting || isDeleting} className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>

          <Dropdown
            disabled={isExporting || isDeleting}
            trigger={
              <Button
                variant="outline"
                size="md"
                disabled={isExporting || isDeleting}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </Button>
            }
            items={[
              {
                label: 'Export as DOCX',
                icon: <File className="w-4 h-4" />,
                onClick: () => onExport(observationId, 'docx')
              },
              {
                label: 'Export as CSV',
                icon: <Table className="w-4 h-4" />,
                onClick: () => onExport(observationId, 'csv')
              }
            ]}
          />

          <Button
            variant="destructive"
            size="md"
            onClick={handleDeleteClick}
            disabled={isExporting || isDeleting}
            className="flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Header card with observation details */}
      <Card className="bg-warm-white">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-gray">Observation Details</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">Patient Name</p>
                <p className="font-medium text-slate-gray">
                  {observation.patient_name || 'Unnamed Patient'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">Observation Date</p>
                <p className="font-medium text-slate-gray">
                  {formatDate(observation.observation_date)}
                </p>
              </div>
            </div>

            {/* NEW: Observation type */}
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">Observation Type</p>
                <p className="font-medium text-slate-gray">{typeLabel}</p>
              </div>
            </div>

            {observation.mode_of_observation && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-gray/60" />
                <div>
                  <p className="text-sm text-slate-gray/70">Mode of Observation</p>
                  <p className="font-medium text-slate-gray">{observation.mode_of_observation}</p>
                </div>
              </div>
            )}

            {observation.caregiver_name && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-gray/60" />
                <div>
                  <p className="text-sm text-slate-gray/70">Caregiver</p>
                  <p className="font-medium text-slate-gray">{observation.caregiver_name}</p>
                  {observation.caregiver_email && (
                    <p className="text-sm text-slate-gray/60">{observation.caregiver_email}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {observation.notes && (
            <div className="mt-6 pt-4 border-t border-slate-gray/20">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-gray/60 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-gray/70 mb-1">Notes</p>
                  <p className="text-slate-gray">{observation.notes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responses grouped by category */}
      {categorizedResponses.length > 0 ? (
        <div className="space-y-6">
          {categorizedResponses.map((category) => (
            <Card key={category.id} className="bg-warm-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-slate-gray">{category.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      category.type === 'ADL'
                        ? 'bg-cyan-primary/20 text-cyan-primary'
                        : 'bg-mint-green/60 text-slate-gray'
                    }`}
                  >
                    {category.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.responses.map((response, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-gray/10 last:border-b-0"
                    >
                      <div className="flex-1 mb-2 sm:mb-0">
                        <p className="text-slate-gray">{response.question.question_text}</p>
                        {response.notes && (
                          <p className="text-sm text-slate-gray/70 mt-1">{response.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-semibold ${
                            response.score >= 4
                              ? 'bg-mint-green/60 text-slate-gray'
                              : response.score >= 3
                              ? 'bg-cyan-primary/20 text-cyan-primary'
                              : 'bg-peach-blush/60 text-slate-gray'
                          }`}
                        >
                          {response.score}
                        </span>
                        <span className="text-slate-gray/60 text-sm">/5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-warm-white">
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-gray/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-gray mb-2">No Responses</h3>
              <p className="text-slate-gray/70">This observation has no recorded responses.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Legend Display */}
      <ScoreLegendDisplay />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Observation?"
        message={
          observation
            ? `Are you sure you want to delete the observation for "${observation.patient_name || 'Unnamed Patient'}" from ${formatDate(observation.observation_date)}? This action cannot be undone.`
            : 'Are you sure you want to delete this observation? This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
