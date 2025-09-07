// src/components/caregiver/ObservationForm.tsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { useUpsertObservationAndResponses } from '../../hooks/useObservations'
import { Button } from '../ui/Button'
import { ScoreLegendDisplay } from './ScoreLegendDisplay'
import ScorePicker from '../ui/ScorePicker' // ✅ default import

interface ObservationFormProps {
  onComplete: () => void
}

export type CategoryQuestionRow = {
  category_id: string
  category_name: string
  category_type: string
  category_order: number
  question_id: string
  question_text: string
  question_order: number
}

type Category = {
  id: string
  name: string
  category_type: string
  order: number
  questions: { id: string; text: string; order: number }[]
}

export default function ObservationForm({ onComplete }: ObservationFormProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const upsertObservation = useUpsertObservationAndResponses()

  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] = useState<
    'In Person' | 'Voice Call' | 'Video Call'
  >('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)

  // Date validation (MM/DD/YYYY)
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

  // Convert MM/DD/YYYY → YYYY-MM-DD for DB
  const formatDateForDB = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return ''
    const [month, day, year] = dateString.split('/').map(Number)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  // Fetch category+question rows (gated on auth)
  const {
    data: categoryQuestions,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['category-questions', user?.id],
    enabled: !authLoading && !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<CategoryQuestionRow[]> => {
      if (!user?.id) return []
      const { data, error } = await supabase
        .from('v_category_questions')
        .select(
          'category_id, category_name, category_type, category_order, question_id, question_text, question_order'
        )
        .order('category_order', { ascending: true })
        .order('question_order', { ascending: true })
      if (error) throw new Error(error.message)
      return data || []
    }
  })

  // Transform rows → Category[]
  const categories: Category[] = React.useMemo(() => {
    if (!categoryQuestions) return []
    const map = new Map<string, Category>()
    categoryQuestions.forEach((item) => {
      // Skip incomplete rows (defensive)
      if (
        !item.category_id ||
        !item.category_name ||
        !item.category_type ||
        item.category_order == null ||
        !item.question_id ||
        !item.question_text ||
        item.question_order == null
      ) {
        return
      }

      if (!map.has(item.category_id)) {
        map.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
          category_type: item.category_type ?? 'general',
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
    result.sort((a, b) => {
      const aType = a.category_type ?? 'general'
      const bType = b.category_type ?? 'general'
      return aType === bType ? a.order - b.order : aType.localeCompare(bType)
    })
    result.forEach((cat) => cat.questions.sort((a, b) => a.order - b.order))
    return result
  }, [categoryQuestions])

  // question_id → category_id map for saving responses
  const questionCategoryMap: Record<string, string> = React.useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((category) => {
      if (!category.id) return
      category.questions.forEach((question) => {
        if (!question.id) return
        map[question.id] = category.id
      })
    })
    return map
  }, [categories])

  // Derived validation flags
  const isValidDate = dateOfObservation ? validateDate(dateOfObservation) : false
  const hasAnyScore = React.useMemo(
    () => Object.values(answers).some((v) => typeof v === 'number'),
    [answers]
  )

  // Save helpers
  const handleSave = async (exitAfterSave: boolean) => {
    console.log('[ObservationForm] handleSave called', { exitAfterSave })
    setSaveError(null)
    setSaveSuccessMessage(null)
    setIsSaving(true)

    if (!dateOfObservation) {
      setDateError('Date of observation is required')
      setIsSaving(false)
      console.log('[ObservationForm] early return: no date')
      return
    }
    if (!validateDate(dateOfObservation)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
      setIsSaving(false)
      console.log('[ObservationForm] early return: invalid date format')
      return
    }
    if (!hasAnyScore) {
      setSaveError('Please select at least one score before saving.')
      setIsSaving(false)
      console.log('[ObservationForm] early return: no scores selected')
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)
    const caregiver_name =
      (profile?.display_name || '').trim() || profile?.email || user?.email || ''
    const caregiver_email = profile?.email || user?.email || ''

    try {
      console.log('[ObservationForm] upsertObservation.mutateAsync firing...')
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

      if (!currentObservationId) setCurrentObservationId(result.id)

      if (exitAfterSave) {
        console.log('[ObservationForm] save success → onComplete()')
        onComplete() // parent should navigate to /caregiver
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
    console.log('[ObservationForm] handleSubmit (form submit)')
    handleSave(true)
  }

  const handleInterimSave = () => {
    handleSave(false)
  }

  const setCategoryNote = (categoryId: string, value: string) => {
    setCategoryNotes((prev) => ({ ...prev, [categoryId]: value }))
  }

  if (authLoading || isLoading) {
    return (
      <div className="text-slate-gray/60 bg-warm-white border border-slate-gray/20 rounded-xl p-4">
        Loading questions…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-4">
        <p className="text-slate-gray mb-2">Error loading questions: {error?.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded border border-slate-gray/30 px-3 py-1 text-sm hover:bg-peach-blush/20 text-slate-gray"
        >
          Try again
        </button>
      </div>
    )
  }

  // Friendly empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-6 text-center">
        <p className="text-slate-gray mb-2">No questions available</p>
        <p className="text-slate-gray/60 text-sm">Please contact support if this issue persists.</p>
      </div>
    )
  }

  // Score legend for the picker
  const legendMap: Record<number, string> = {
    1: 'Total assistance',
    2: 'Constant Shared effort',
    3: 'Independent with support',
    4: 'Independent with difficulty',
    5: 'Fully independent'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Observation</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">Patient Name</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Date of Observation <span className="text-peach-blush">*</span>
              </label>
              <input
                type="text"
                value={dateOfObservation}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  dateError
                    ? 'border-peach-blush focus:border-peach-blush focus:ring-peach-blush'
                    : 'border-slate-gray/30 focus:border-cyan-primary focus:ring-cyan-primary'
                } focus:outline-none focus:ring-2 bg-warm-white text-slate-gray`}
                placeholder="MM/DD/YYYY"
              />
              {dateError && <p className="text-slate-gray text-sm mt-1">{dateError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Mode of Observation
              </label>
              <select
                value={modeOfObservation}
                onChange={(e) =>
                  setModeOfObservation(e.target.value as 'In Person' | 'Voice Call' | 'Video Call')
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
              >
                <option value="In Person">In Person</option>
                <option value="Voice Call">Voice Call</option>
                <option value="Video Call">Video Call</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-slate-gray mb-2">
              Administrative Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full flex-1 px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary resize-none bg-warm-white text-slate-gray"
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
          <div key={category.id} className="bg-warm-white border border-slate-gray/20 rounded-xl">
            <div className="px-4 py-3 border-b border-slate-gray/20 bg-gradient-to-r from-cyan-primary/5 to-mint-green/10">
              <div className="font-semibold text-slate-gray">
                {category.name}{' '}
                <span className="text-slate-gray/60 text-sm">
                  ({category.category_type ?? 'general'})
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {category.questions.map((question) => (
                  <div key={question.id} className="grid md:grid-cols-12 items-center gap-3">
                    <div className="md:col-span-9 text-slate-gray">{question.text}</div>
                    <div className="md:col-span-3">
                      <ScorePicker
                        value={answers[question.id]}
                        onChange={(val) =>
                          setAnswers((prev) => ({ ...prev, [question.id]: val }))
                        }
                        descriptions={legendMap}
                        ariaLabel={`Set score for: ${question.text}`}
                      />
                    </div>
                  </div>
                ))}

                {/* Category Notes */}
                <div className="mt-6 pt-4 border-t border-slate-gray/20">
                  <label className="block text-sm font-medium text-slate-gray mb-2">
                    {category.name} Category Notes (Optional)
                  </label>
                  <textarea
                    value={categoryNotes[category.id] || ''}
                    onChange={(e) => setCategoryNote(category.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
                    placeholder={`Enter notes specific to ${category.name} observations...`}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Category Save Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-gray/20">
              <div className="flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <span>{isSaving ? 'Saving...' : 'Save & Exit'}</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleInterimSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          disabled={upsertObservation.isPending || isSaving || !isValidDate || !hasAnyScore}
          title={
            !isValidDate
              ? 'Enter a valid date (MM/DD/YYYY)'
              : !hasAnyScore
              ? 'Select at least one score'
              : undefined
          }
        >
          {upsertObservation.isPending || isSaving ? 'Saving...' : 'Create Observation'}
        </Button>
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
      </div>

      {/* Inline guidance */}
      {(!isValidDate || !hasAnyScore) && (
        <div className="text-slate-gray/70 text-sm">
          {!isValidDate && (
            <div>
              • Enter a valid date in <strong>MM/DD/YYYY</strong>.
            </div>
          )}
          {!hasAnyScore && <div>• Select at least one score to save.</div>}
        </div>
      )}

      {saveError && (
        <div className="mt-3 rounded-md border border-peach-blush bg-peach-blush/20 p-3 text-sm text-slate-gray">
          {saveError}
        </div>
      )}
      {saveSuccessMessage && (
        <div className="mt-3 rounded-md border border-mint-green bg-mint-green/20 p-3 text-sm text-slate-gray">
          {saveSuccessMessage}
        </div>
      )}
    </form>
  )
}
