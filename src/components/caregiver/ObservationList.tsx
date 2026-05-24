// src/components/caregiver/ObservationList.tsx
import React, { useState } from 'react'
import { useObservations } from '../../hooks/useObservations'
import { useLocale } from '../../i18n/LocaleContext'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { Dropdown } from '../ui/Dropdown'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useFormatDate } from '../../hooks/useFormatDate'
import { Eye, FileText, Download, Trash2, File, Table, UserCheck } from 'lucide-react'

interface ObservationListProps {
  onViewObservation: (id: string) => void
  onExportObservation: (id: string, format: 'docx' | 'csv') => void
  onDeleteObservation: (id: string) => void
  deletingId?: string | null
}

type ObservationRow = {
  id: string
  resident_name: string | null
  observation_date: string
  notes: string | null
  caregiver_name: string | null
  caregiver_email: string | null
  created_at: string
  updated_at: string
  /** DB value written by the form: ADL | IADL | BOTH */
  form_type?: 'ADL' | 'IADL' | 'COMPREHENSIVE' | null
  is_guest_submission?: boolean | null
}

const FormTypeChip: React.FC<{ type?: 'ADL' | 'IADL' | 'COMPREHENSIVE' | null }> = ({ type }) => {
  if (!type) return null
  const base = 'text-xs px-2 py-0.5 rounded-full border bg-white inline-flex items-center leading-none'
  const tone =
    type === 'ADL'
      ? 'border-cyan-600 text-cyan-700'
      : type === 'IADL'
      ? 'border-emerald-600 text-emerald-700'
      : 'border-slate-500 text-slate-700' // COMPREHENSIVE
  const label = type === 'COMPREHENSIVE' ? 'ADL + IADL' : type
  return <span className={`${base} ${tone}`}>{label}</span>
}

export const ObservationList: React.FC<ObservationListProps> = ({
  onViewObservation,
  onExportObservation,
  onDeleteObservation,
  deletingId
}) => {
  const { t } = useLocale()
  const { formatDate } = useFormatDate()
  const { data: observations, isLoading, error } = useObservations()
  const [confirmDelete, setConfirmDelete] = useState<ObservationRow | null>(null)

  if (isLoading) return <Loading message={t('obs_list.loading')} />
  if (error) return <div className="text-red-600">{t('obs_list.error')}</div>

  const handleDeleteClick = (observation: ObservationRow) => {
    setConfirmDelete(observation)
  }

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      onDeleteObservation(confirmDelete.id)
      setConfirmDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setConfirmDelete(null)
  }

  if (!observations || observations.length === 0) {
    return (
      <Card className="bg-warm-white">
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-gray/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-gray mb-2">{t('obs_list.empty_title')}</h3>
            <p className="text-slate-gray/70">{t('obs_list.empty_body')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isDeleting = (id: string) => deletingId === id

  return (
    <>
      <div className="space-y-4">
        {(observations as ObservationRow[]).map((o) => {
          const disabled = isDeleting(o.id)

          return (
            <Card key={o.id} className="bg-warm-white">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-gray truncate">
                        {o.resident_name || t('obs_list.unnamed_resident')}
                      </h3>
                      <FormTypeChip type={o.form_type ?? null} />
                      {o.is_guest_submission && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-700">
                          <UserCheck className="w-3 h-3" />
                          {t('obs_list.guest_badge')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-gray/80">{t('obs_list.observed_on') + ' '}{formatDate(o.observation_date)}</p>
                    {o.notes && <p className="text-sm text-slate-gray/60 mt-1 line-clamp-2">{o.notes}</p>}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewObservation(o.id)}
                      disabled={disabled}
                      className="flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('common.view')}</span>
                    </Button>

                    <Dropdown
                      disabled={disabled}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={disabled}
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
                          onClick: () => onExportObservation(o.id, 'docx')
                        },
                        {
                          label: t('obs_list.export_csv'),
                          icon: <Table className="w-4 h-4" />,
                          onClick: () => onExportObservation(o.id, 'csv')
                        }
                      ]}
                    />

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(o)}
                      disabled={disabled}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('common.delete')}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('obs_list.delete_title')}
        message={
          confirmDelete
            ? t('obs_list.delete_confirm', { name: confirmDelete.resident_name || t('obs_list.unnamed_resident'), date: formatDate(confirmDelete.observation_date) })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={confirmDelete ? isDeleting(confirmDelete.id) : false}
        variant="danger"
      />
    </>
  )
}
