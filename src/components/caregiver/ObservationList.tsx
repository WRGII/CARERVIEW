import React from 'react'
import { useObservations } from '../../hooks/useObservations'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { formatDate } from '../../lib/utils'
import { Eye, FileText, Download } from 'lucide-react'

interface ObservationListProps {
  onViewObservation: (id: string) => void
  onExportObservation: (id: string, format: 'docx' | 'csv') => void
}

export const ObservationList: React.FC<ObservationListProps> = ({
  onViewObservation,
  onExportObservation
}) => {
  const { data: observations, isLoading, error } = useObservations()

  if (isLoading) {
    return <Loading message="Loading observations..." />
  }

  if (error) {
    return <div className="text-red-600">Failed to load observations</div>
  }

  if (!observations || observations.length === 0) {
    return (
      <Card className="bg-warm-white">
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-gray/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-gray mb-2">No Observations Yet</h3>
            <p className="text-slate-gray/70">Create your first observation to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {observations.map(observation => (
        <Card key={observation.id} className="bg-warm-white">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-gray">
                    {observation.patient_name || 'Unnamed Patient'}
                  </h3>
                  {observation.form_type && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-white">
                      {observation.form_type}
                    </span>
                  )}
                </div>
                <p className="text-slate-gray/80">
                  Observed on {formatDate(observation.observation_date)}
                </p>
                {observation.notes && (
                  <p className="text-sm text-slate-gray/60 mt-1">{observation.notes}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewObservation(observation.id)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportObservation(observation.id, 'docx')}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>DOCX</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportObservation(observation.id, 'csv')}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}