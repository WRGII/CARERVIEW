import React, { useState } from 'react'
import { useObservation } from '../../hooks/useObservations'
import { useLocale } from '../../i18n/LocaleContext'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Dropdown } from '../ui/Dropdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Loading } from '../ui/Loading'
import { ErrorMessage } from '../ui/ErrorMessage'
import { useFormatDate } from '../../hooks/useFormatDate'
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
  const { t } = useLocale()
  const { formatDate } = useFormatDate()
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

  if (isLoading) return <Loading message={t('obs_list.loading')} />
  if (error) return <ErrorMessage message={error.message || t('view_obs.load_error')} />
  if (!observation) return <ErrorMessage message={t('caregiver.obs_not_found')} />

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
      ? t('obs_form.comprehensive_label')
      : observation.form_type || '—'

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('view_obs.back_list')}</span>
          </Button>
          <h2 className="text-xl font-semibold text-slate-700">{t('view_obs.title')}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePrint} disabled={isExporting || isDeleting} className="flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>{t('view_obs.print')}</span>
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
                <span>{t('common.download')}</span>
              </Button>
            }
            items={[
              {
                label: t('obs_list.export_docx'),
                icon: <File className="w-4 h-4" />,
                onClick: () => onExport(observationId, 'docx')
              },
              {
                label: t('obs_list.export_csv'),
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
            <span>{t('common.delete')}</span>
          </Button>
        </div>
      </div>

      {/* Header card with observation details */}
      <Card className="bg-warm-white">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-gray">{t('view_obs.details_title')}</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">{t('view_obs.patient_name')}</p>
                <p className="font-medium text-slate-gray">
                  {observation.patient_name || t('obs_list.unnamed_patient')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">{t('view_obs.obs_date')}</p>
                <p className="font-medium text-slate-gray">
                  {formatDate(observation.observation_date)}
                </p>
              </div>
            </div>

            {/* NEW: Observation type */}
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-slate-gray/60" />
              <div>
                <p className="text-sm text-slate-gray/70">{t('view_obs.obs_type')}</p>
                <p className="font-medium text-slate-gray">{typeLabel}</p>
              </div>
            </div>

            {observation.mode_of_observation && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-gray/60" />
                <div>
                  <p className="text-sm text-slate-gray/70">{t('view_obs.mode')}</p>
                  <p className="font-medium text-slate-gray">{observation.mode_of_observation}</p>
                </div>
              </div>
            )}

            {observation.caregiver_name && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-gray/60" />
                <div>
                  <p className="text-sm text-slate-gray/70">{t('view_obs.caregiver')}</p>
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
                  <p className="text-sm text-slate-gray/70 mb-1">{t('view_obs.notes')}</p>
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
                            response.score <= 2
                              ? 'bg-mint-green/60 text-slate-gray'
                              : response.score <= 3
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
              <h3 className="text-lg font-medium text-slate-gray mb-2">{t('view_obs.no_responses')}</h3>
              <p className="text-slate-gray/70">{t('view_obs.no_responses_body')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Legend Display */}
      <ScoreLegendDisplay />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete}
        title={t('obs_list.delete_title')}
        message={
          observation
            ? t('obs_list.delete_confirm', { name: observation.patient_name || t('obs_list.unnamed_patient'), date: formatDate(observation.observation_date) })
            : t('obs_list.delete_confirm_generic')
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  )
}
