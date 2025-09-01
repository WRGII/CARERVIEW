import React from 'react'
import { useObservation } from '../../hooks/useObservations'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { ErrorMessage } from '../ui/ErrorMessage'
import { formatDate } from '../../lib/utils'
import { ArrowLeft, User, Calendar, Phone, Mail, FileText } from 'lucide-react'

interface ViewObservationProps {
  observationId: string
  onBack: () => void
}

export const ViewObservation: React.FC<ViewObservationProps> = ({
  observationId,
  onBack
}) => {
  const { data: observation, isLoading, error } = useObservation(observationId)

  if (isLoading) {
    return <Loading message="Loading observation..." />
  }

  if (error) {
    return <ErrorMessage message={error.message || 'Failed to load observation'} />
  }

  if (!observation) {
    return <ErrorMessage message="Observation not found" />
  }

  // Group responses by category
  const categorizedResponses = React.useMemo(() => {
    const categoryMap = new Map<string, {
      id: string
      name: string
      type: 'ADL' | 'IADL'
      responses: Array<{
        score: number
        notes: string | null
        question: {
          question_text: string
          sort_order: number
        }
      }>
    }>()

    observation.responses?.forEach(response => {
      const category = response.question?.category
      if (!category) return

      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          type: category.type,
          responses: []
        })
      }

      categoryMap.get(category.id)!.responses.push({
        score: response.score,
        notes: response.notes,
        question: {
          question_text: response.question.question_text,
          sort_order: response.question.sort_order
        }
      })
    })

    // Sort categories: ADL before IADL, then by name
    const categories = Array.from(categoryMap.values())
    categories.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'ADL' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    // Sort questions within each category by sort_order
    categories.forEach(category => {
      category.responses.sort((a, b) => a.question.sort_order - b.question.sort_order)
    })

    return categories
  }, [observation.responses])

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </Button>
        <h2 className="text-xl font-semibold text-slate-900">View Observation</h2>
      </div>

      {/* Header card with observation details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Observation Details</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Patient Name</p>
                <p className="font-medium text-slate-900">
                  {observation.patient_name || 'Unnamed Patient'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-600">Observation Date</p>
                <p className="font-medium text-slate-900">
                  {formatDate(observation.observation_date)}
                </p>
              </div>
            </div>

            {observation.mode_of_observation && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Mode of Observation</p>
                  <p className="font-medium text-slate-900">{observation.mode_of_observation}</p>
                </div>
              </div>
            )}

            {observation.caregiver_name && (
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Caregiver</p>
                  <p className="font-medium text-slate-900">{observation.caregiver_name}</p>
                  {observation.caregiver_email && (
                    <p className="text-sm text-slate-500">{observation.caregiver_email}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {observation.notes && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 mb-1">Notes</p>
                  <p className="text-slate-900">{observation.notes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responses grouped by category */}
      {categorizedResponses.length > 0 ? (
        <div className="space-y-6">
          {categorizedResponses.map(category => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {category.name}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    category.type === 'ADL' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {category.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.responses.map((response, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div className="flex-1 mb-2 sm:mb-0">
                        <p className="text-slate-900">{response.question.question_text}</p>
                        {response.notes && (
                          <p className="text-sm text-slate-600 mt-1">{response.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-semibold ${
                          response.score >= 7 
                            ? 'bg-green-100 text-green-800' 
                            : response.score >= 4 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {response.score}
                        </span>
                        <span className="text-slate-500 text-sm">/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Responses</h3>
              <p className="text-slate-600">This observation has no recorded responses.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}