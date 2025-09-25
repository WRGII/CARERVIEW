// src/components/caregiver/ObservationForm.tsx
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useLegend } from '../../hooks/useLegend'
import { useUpsertObservationAndResponses } from '../../hooks/useObservations'
import { useCategoryQuestions } from '../../hooks/useCategoryQuestions'
import { Button } from '../ui/Button'
import { ScoreLegendDisplay } from './ScoreLegendDisplay'
import ScorePicker from '../ui/ScorePicker'
import { ThumbsDown, ThumbsUp } from 'lucide-react'

interface ObservationFormProps {
  /** When provided, we are editing an existing observation */
  observationId?: string
  formType: 'ADL' | 'IADL' | 'COMPREHENSIVE'
  onComplete: () => void
}

/** Matches the rows returned by v_category_questions (canonical column: `type`) */
type CategoryQuestionRow = {
  category_id: string
  category_name: string
  type: 'ADL' | 'IADL'
  category_order: number
  question_id: string
  question_text: string
  question_order: number
}

type Category = {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  order: number
  questions: { id: string; text: string; order: number }[]
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ObservationForm({
  observationId,
  formType,
  onComplete,
}: ObservationFormProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const upsertObservation = useUpsertObservationAndResponses()

  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] =
    useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(observationId ?? null)

  React.useEffect(() => {
    // keep in sync if parent changes id
    if (observationId) setCurrentObservationId(observationId)
  }, [observationId])

  // Prefill date to today on first mount (safer first-save path)
  React.useEffect(() => {
    if (!dateOfObservation) {
      const t = new Date()
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const dd = String(t.getDate()).padStart(2, '0')
      const yyyy = t.getFullYear()
      setDateOfObservation(`${mm}/${dd}/${yyyy}`) // MM/DD/YYYY
    }
  }, []) // run once

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null)

  const displayFormType =
    formType === 'COMPREHENSIVE' ? 'Comprehensive (ADL + IADL)' : formType

  // --- date helpers ---
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

  const formatDateForDB = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return ''
    const [month, day, year] = dateString.split('/').map(Number)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  // --- data: category + questions (from view via hook) ---
  const {
    data: categoryQuestions,
    isLoading: cqLoading,
    isError: cqIsError,
    error: cqError,
    refetch: cqRefetch,
  } = useCategoryQuestions(formType)

  // --- data: legend 1–5 (auth-gated via hook) ---
  const { data: legendRows, isLoading: legendLoading, isError: legendIsError } = useLegend()

  const legendMap: Record<number, string> = React.useMemo(() => {
    const m: Record<number, string> = {}
    ;(legendRows ?? []).forEach((r) => {
      if (typeof r.score === 'number' && r.description) m[r.score] = r.description
    })
    return m
  }, [legendRows])

  // --- transform rows -> Category[] ---
  const categories: Category[] = React.useMemo(() => {
    if (!categoryQuestions) return []
    const map = new Map<string, Category>()
    ;(categoryQuestions as CategoryQuestionRow[]).forEach((item) => {
      if (
        !item.category_id ||
        !item.category_name ||
        !item.type ||
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
          type: item.type,              // ← canonical column
          order: item.category_order,
          questions: [],
        })
      }
      map.get(item.category_id)!.questions.push({
        id: item.question_id,
        text: item.question_text,
        order: item.question_order,
      })
    })

    const result = Array.from(map.values())
    const orderOfType = (t: 'ADL' | 'IADL') => (t === 'ADL' ? 0 : 1)
    result.sort((a, b) => orderOfType(a.type) - orderOfType(b.type) || a.order - b.order)
    result.forEach((cat) => cat.questions.sort((a, b) => a.order - b.order))
    return result
  }, [categoryQuestions])

  // --- question_id -> category_id map (for saving responses) ---
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

  // --- derived flags ---
  const isValidDate = dateOfObservation ? validateDate(dateOfObservation) : false
  const hasAnyScore = React.useMemo(
    () => Object.values(answers).some((v) => typeof v === 'number'),
    [answers]
  )

  // --- save ---
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
    if (!hasAnyScore) {
      setSaveError('Please select at least one score before saving.')
      setIsSaving(false)
      return
    }

    const caregiver_name =
      (profile?.display_name || '').trim() ||
      (profile?.email || '').trim() ||
      (user?.email || '').trim()

    const caregiver_email = (profile?.email || user?.email || '').trim()

    if (!emailRegex.test(caregiver_email)) {
      setSaveError('Your account email is missing or invalid. Please sign out and sign in again, or contact support.')
      setIsSaving(false)
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)

    const payload = {
      observationId: currentObservationId || undefined,
      observation: {
        patient_name: patientName,
        observation_date: formattedDate,
        mode_of_observation: modeOfObservation,
        notes,
        caregiver_name,
        caregiver_email,
        form_type: formType, // ADL | IADL | COMPREHENSIVE
      },
      answers,
      categoryNotes,
      questionCategoryMap,
    }

    try {
      const result = await upsertObservation.mutateAsync(payload)
      if (!currentObservationId) setCurrentObservationId(result.id)
      await queryClient.invalidateQueries({ queryKey: ['observations', user?.id] })

      if (exitAfterSave) {
        onComplete()
      } else {
        setSaveSuccessMessage('Observation saved successfully!')
        setTimeout(() => setSaveSuccessMessage(null), 3000)
      }
    } catch (e: any) {
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
    setCategoryNotes((prev) => ({ ...prev, [categoryId]: value }))
  }

  // --- loading & error states (include legend) ---
  if (authLoading || cqLoading || legendLoading) {
    return (
      <div className="text-slate-gray/60 bg-warm-white border border-slate-gray/20 rounded-xl p-4">
        Loading questions…
      </div>
    )
  }

  if (cqIsError || legendIsError) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-4">
        <p className="text-slate-gray mb-2">
          {cqError ? String((cqError as any)?.message || cqError) : 'Error loading data.'}
        </p>
        <button
          type="button"
          onClick={() => cqRefetch()}
          className="rounded border border-slate-gray/30 px-3 py-1 text-sm hover:bg-peach-blush/20 text-slate-gray"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-6 text-center">
        <p className="text-slate-gray mb-2">No questions available</p>
        <p className="text-slate-gray/60 text-sm">Please contact support if this issue persists.</p>
      </div>
    )
  }

  const isEditing = Boolean(currentObservationId)

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Observation' : 'Create New Observation'}{' '}
          <span className="text-slate-500">({displayFormType})</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Patient Name <span className="text-xs text-slate-gray/60">(required)</span>
              </label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
                placeholder="Enter patient name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-gray mb-2">
                Date of Observation <span className="text-xs text-slate-gray/60">(required)</span>
              </label>
              <input
                type="text"
                required
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
                Mode of Observation <span className="text-xs text-slate-gray/60">(required)</span>
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
            <div className="px-4 py-3 border-b border-slate-gray/20 bg-gradient-to-r from-cyan-primary/5 to-mint-green/10 relative">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-gray">
                  {category.name}{' '}
                  <span className="text-slate-gray/60 text-sm
