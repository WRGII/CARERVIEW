// src/components/caregiver/ObservationForm.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { useUpsertObservationAndResponses } from '../../hooks/useObservations'
import { Button } from '../ui/Button'
import { ScoreLegendDisplay } from './ScoreLegendDisplay'
import ScorePicker from '../ui/ScorePicker'   // ✅ default import

interface ObservationFormProps {
  onComplete: () => void
}

type CategoryQuestion = {
  category_id: string
  category_name: string
  type: 'ADL' | 'IADL'
  category_order: number
  question_id: string
  question_order: number
  question_text: string
}

type Category = {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  order: number
  questions: { id: string; text: string; order: number }[]
}

export default function ObservationForm({ onComplete }: ObservationFormProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const upsertObservation = useUpsertObservationAndResponses()

  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] = useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)

  // Date validation function (MM/DD/YYYY)
  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
    if (!dateRegex.test(dateString)) return false
    const [month, day, year] = dateString.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  }

  const handleDateChange = (value: string) => {
    setDateOfObservation(value)
    if (value && !validateDate(value)) setDateError('Please enter a valid date in MM/DD/YYYY format')
    else setDateError('')
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD for DB
  const formatDateForDB = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return ''
    const [month, day, year] = dateString.split('/').map(Number)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  // Gate the query on auth readiness
  const { data: categoryQuestions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['category-questions', user?.id],
    enabled: !authLoading && !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<CategoryQuestion[]> => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('v_category_questions')
        .select('*')
        .order('type', { ascending: true })
        .order('category_order', { ascending: true })
        .order('question_order', { ascending: true })
      if (error) throw new Error(error.message)
      return data || []
    }
  })

  // Transform into categories with questions
  const categories: Category[] = React.useMemo(() => {
    if (!categoryQuestions) return []
    const map = new Map<string, Category>()
    categoryQuestions.forEach(item => {
      if (!map.has(item.category_id)) {
        map.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
          type: item.type,
          order: item.category_order,
          questions: []
        })
      }
      map.get(item.category_id)!.questions.push({
        id: item.question_id,
        text: item.question_text,
        order: item.question_order
      })
    })
    const result = Array.from(map.values())
    result.sort((a, b) => (a.type === b.type ? a.order - b.order : a.type.localeCompare(b.type)))
    result.forEach(cat => cat.questions.sort((a, b) => a.order - b.order))
    return result
  }, [categoryQuestions])

  // Create question to category mapping for responses
  const questionCategoryMap: Record<string, string> = React.useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach(category => {
      category.questions.forEach(question => {
        map[question.id] = category.id
      })
    })
    return map
  }, [categories])

  const handleSave = async (exitAfterSave: boolean) => {
    setSaveError(null)
    setSaveSuccessMessage(null)
    setIsSaving(true)

    if (!dateOfObservation) {
      setDateError('Date of observation is required')
      setIsSaving(false)
      return
    }
    if (!validateDate(dateOfObservation)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
      setIsSaving(false)
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)
    const hasAnyScore = Object.values(answers).some(v => typeof v === 'number')
    if (!hasAnyScore) {
      setSaveError('Please select at least one score before saving.')
      setIsSaving(false)
      return
    }

    const caregiver_name =
      (profile?.display_name || '').trim() || profile?.email || user.email || ''
    const caregiver_email = profile?.email || user.email || ''

    try {
      const result = await upsertObservation.mutateAsync({
        observationId: currentObservationId || undefined,
        observation: {
          patient_name: patientName,
          observation_date: formattedDate,
          mode_of_observation: modeOfObservation,
          notes,
          caregiver_name,
          caregiver_email
        },
        answers,
        categoryNotes,
        questionCategoryMap
      })

      // Update current observation ID for future saves
      if (!currentObservationId) {
        setCurrentObservationId(result.id)
      }

      if (exitAfterSave) {
        onComplete()
      } else {
        setSaveSuccessMessage('Observation saved successfully!')
        setTimeout(() => setSaveSuccessMessage(null), 3000)
      }
    } catch (e: any) {
      console.error('Save observation failed:', e)
      setSaveError(e?.message || 'Failed to save observation.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave(true)
  }

  const handleInterimSave = () => {
    handleSave(false)
  }

  const setCategoryNote = (categoryId: string, value: string) => {
    setCategoryNotes(prev => ({ ...prev, [categoryId]: value }))
  }

  if (authLoading || isLoading) {
    return <div className="text-slate-500 bg-white border rounded-xl p-4">Loading questions…</div>
  }

  if (isError) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <p className="text-red-700 mb-2">Error loading questions: {error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    )
  }

  // Map scores to descriptions for ScorePicker
  const legendMap: Record<number, string> = {
    1: 'Total assistance',
    2: 'Constant Shared effort',
    3: 'Independent with support',
    4: 'Independent with difficulty',
    5: 'Fully independent'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Observation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Observation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dateOfObservation}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  dateError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                } focus:outline-none focus:ring-2`}
                placeholder="MM/DD/YYYY"
                required
              />
              {dateError && <p className="text-red-600 text-sm mt-1">{dateError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mode of Observation</label>
              <select
                value={modeOfObservation}
                onChange={(e) => setModeOfObservation(e.target.value as 'In Person' | 'Voice Call' | 'Video Call')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="In Person">In Person</option>
                <option value="Voice Call">Voice Call</option>
                <option value="Video Call">Video Call</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-slate-700 mb-2">Administrative Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter any notes"
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>
      </div>

      {/* Legend Section */}
      <ScoreLegendDisplay />

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white border rounded-xl">
            <div className="px-4 py-3 border-b bg-slate-50">
              <div className="font-semibold text-slate-900">
                {category.name}{' '}
                <span className="text-slate-500 text-sm">({category.type})</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {category.questions.map((question) => (
                  <div key={question.id} className="grid md:grid-cols-12 items-center gap-3">
                    <div className="md:col-span-9 text-slate-800">{question.text}</div>
                    <div className="md:col-span-3">
                      <ScorePicker
                        value={answers[question.id]}
                        onChange={(val) => setAnswers(prev => ({ ...prev, [question.id]: val }))}
                        descriptions={legendMap}    // ✅ fixed prop
                        ariaLabel={`Set score for: ${question.text}`}
                      />
                    </div>
                  </div>
                ))}

                {/* Category Notes Section */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {category.name} Category Notes (Optional)
                  </label>
                  <textarea
                    value={categoryNotes[category.id] || ''}
                    onChange={(e) => setCategoryNote(category.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter notes specific to ${category.name} observations...`}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={upsertObservation.isPending} variant="primary">
          {upsertObservation.isPending ? 'Saving...' : 'Create Observation'}
        </Button>
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
      </div>

      {saveError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
    </form>
  )
}
