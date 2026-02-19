// src/components/caregiver/ObservationForm.tsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useLegend } from '../../hooks/useLegend'
import { useUpsertObservationAndResponses } from '../../hooks/useObservations'
import { useCategoryQuestions } from '../../hooks/useCategoryQuestions'
import ScorePicker from '../ui/ScorePicker'

interface ObservationFormProps {
  observationId?: string
  formType: 'ADL' | 'IADL' | 'COMPREHENSIVE'
  onComplete: () => void
}

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

const AUTO_SAVE_INTERVAL_MS = 45_000 // 45 seconds

export default function ObservationForm({
  observationId,
  formType,
  onComplete,
}: ObservationFormProps) {
  const { user, profile, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const upsertObservation = useUpsertObservationAndResponses()

  const obsIdRef = useRef<string | null>(observationId ?? null)
  const [currentObservationId, setCurrentObservationId] = useState<string | null>(observationId ?? null)

  useEffect(() => {
    if (observationId) {
      obsIdRef.current = observationId
      setCurrentObservationId(observationId)
    }
  }, [observationId])

  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] =
    useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (!dateOfObservation) {
      const t = new Date()
      const mm = String(t.getMonth() + 1).padStart(2, '0')
      const dd = String(t.getDate()).padStart(2, '0')
      const yyyy = t.getFullYear()
      setDateOfObservation(`${mm}/${dd}/${yyyy}`)
    }
  }, [])

  const displayFormType =
    formType === 'COMPREHENSIVE' ? 'Comprehensive (ADL + IADL)' : formType

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
    if (value && !validateDate(value))
      setDateError('Please enter a valid date in MM/DD/YYYY format')
    else setDateError('')
  }

  const formatDateForDB = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return ''
    const [month, day, year] = dateString.split('/').map(Number)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  const {
    data: categoryQuestions,
    isLoading: cqLoading,
    isError: cqIsError,
    error: cqError,
    refetch: cqRefetch,
  } = useCategoryQuestions(formType)

  const { data: legendRows, isLoading: legendLoading, isError: legendIsError } = useLegend()

  const legendMap: Record<number, string> = useMemo(() => {
    const m: Record<number, string> = {}
    ;(legendRows ?? []).forEach((r) => {
      if (typeof r.score === 'number' && r.description) m[r.score] = r.description
    })
    return m
  }, [legendRows])

  const categories: Category[] = useMemo(() => {
    if (!categoryQuestions) return []
    const map = new Map<string, Category>()
    ;(categoryQuestions as CategoryQuestionRow[]).forEach((item) => {
      if (
        !item.category_id || !item.category_name || !item.type ||
        item.category_order == null || !item.question_id ||
        !item.question_text || item.question_order == null
      ) return
      if (!map.has(item.category_id)) {
        map.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
          type: item.type,
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

  const questionCategoryMap: Record<string, string> = useMemo(() => {
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

  const isValidDate = dateOfObservation ? validateDate(dateOfObservation) : false
  const hasAnyScore = useMemo(
    () => Object.values(answers).some((v) => typeof v === 'number'),
    [answers]
  )

  const canSave = isValidDate && hasAnyScore

  const handleSave = useCallback(async (exitAfterSave: boolean, isAutoSave = false) => {
    setSaveError(null)
    if (isAutoSave) {
      setAutoSaveStatus('saving')
    } else {
      setIsSaving(true)
    }

    if (!dateOfObservation) {
      setDateError('Date of observation is required')
      setIsSaving(false)
      if (isAutoSave) setAutoSaveStatus('error')
      return
    }
    if (!validateDate(dateOfObservation)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
      setIsSaving(false)
      if (isAutoSave) setAutoSaveStatus('error')
      return
    }
    if (!hasAnyScore) {
      if (!isAutoSave) setSaveError('Please select at least one score before saving.')
      setIsSaving(false)
      if (isAutoSave) setAutoSaveStatus('idle')
      return
    }

    const caregiver_name =
      (profile?.display_name || '').trim() ||
      (profile?.email || '').trim() ||
      (user?.email || '').trim()

    const caregiver_email = (profile?.email || user?.email || '').trim()

    if (!emailRegex.test(caregiver_email)) {
      setSaveError('Your account email is missing or invalid. Please sign out and sign in again.')
      setIsSaving(false)
      if (isAutoSave) setAutoSaveStatus('error')
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)
    const effectiveId = obsIdRef.current || undefined

    const payload = {
      observationId: effectiveId,
      observation: {
        patient_name: patientName,
        observation_date: formattedDate,
        mode_of_observation: modeOfObservation,
        notes,
        caregiver_name,
        caregiver_email,
        form_type: formType,
      },
      answers,
      categoryNotes,
      questionCategoryMap,
    }

    try {
      const result = await upsertObservation.mutateAsync(payload)
      if (!obsIdRef.current) {
        obsIdRef.current = result.id
        setCurrentObservationId(result.id)
      }
      await queryClient.invalidateQueries({ queryKey: ['observations', user?.id] })
      setLastSavedAt(new Date())
      if (isAutoSave) {
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
      if (exitAfterSave) {
        onComplete()
      }
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save observation.')
      if (isAutoSave) setAutoSaveStatus('error')
    } finally {
      if (!isAutoSave) setIsSaving(false)
    }
  }, [
    dateOfObservation, hasAnyScore, patientName, modeOfObservation, notes,
    answers, categoryNotes, questionCategoryMap, formType, profile, user,
    upsertObservation, queryClient, onComplete,
  ])

  // Auto-save every 45 seconds if there's something to save
  useEffect(() => {
    if (!canSave) return
    const timer = setInterval(() => {
      handleSave(false, true)
    }, AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [canSave, handleSave])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSave(true)
  }

  const setCategoryNote = (categoryId: string, value: string) => {
    setCategoryNotes((prev) => ({ ...prev, [categoryId]: value }))
  }

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const scoredCount = Object.values(answers).filter((v) => typeof v === 'number').length
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0)

  if (authLoading || cqLoading || legendLoading) {
    return (
      <div className="text-slate-gray/60 bg-warm-white border border-slate-gray/20 rounded-xl p-6 text-center">
        Loading your observation form…
      </div>
    )
  }

  if (cqIsError || legendIsError) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-6">
        <p className="text-slate-gray mb-3">
          {cqError ? String((cqError as any)?.message || cqError) : 'Error loading data.'}
        </p>
        <button
          type="button"
          onClick={() => cqRefetch()}
          className="rounded-lg border border-slate-gray/30 px-4 py-2 text-sm font-medium hover:bg-peach-blush/20 text-slate-gray transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-warm-white border border-slate-gray/20 rounded-xl p-8 text-center">
        <p className="text-slate-gray mb-2">No questions available</p>
        <p className="text-slate-gray/60 text-sm">Please contact support if this issue persists.</p>
      </div>
    )
  }

  const isEditing = Boolean(obsIdRef.current)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Top guidance banner */}
      <div className="bg-cyan-primary/8 border border-cyan-primary/20 rounded-xl px-5 py-4">
        <p className="text-slate-700 text-sm leading-relaxed">
          <span className="font-semibold text-slate-800">Fill in as much or as little as you like.</span>{' '}
          You don't need to answer every question — even a few scores are helpful. Your work saves automatically every 45 seconds once you've entered at least one score.
        </p>
      </div>

      {/* Header card — observation details */}
      <div className="bg-warm-white border border-slate-gray/15 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-gray/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {isEditing ? 'Edit Observation' : 'New Observation'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{displayFormType}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto-save status */}
              {autoSaveStatus === 'saving' && (
                <span className="text-xs text-slate-400">Saving…</span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="text-xs text-cyan-primary font-medium">Saved</span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-xs text-red-500">Save failed</span>
              )}
              {lastSavedAt && autoSaveStatus === 'idle' && (
                <span className="text-xs text-slate-400">Last saved {formatLastSaved(lastSavedAt)}</span>
              )}
              {/* Progress pill */}
              {totalQuestions > 0 && (
                <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-3 py-1 font-medium">
                  {scoredCount} of {totalQuestions} scored
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Person being observed */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Person being observed
              </label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 bg-white text-slate-800 text-base transition-colors placeholder:text-slate-400"
                placeholder="Their name"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date of observation
              </label>
              <input
                type="text"
                value={dateOfObservation}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-base transition-colors ${
                  dateError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-cyan-primary focus:ring-cyan-primary/20'
                } focus:outline-none focus:ring-2 bg-white text-slate-800 placeholder:text-slate-400`}
                placeholder="MM/DD/YYYY"
              />
              {dateError && <p className="text-red-500 text-xs mt-1.5">{dateError}</p>}
            </div>

            {/* How you observed */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                How did you observe?
              </label>
              <select
                value={modeOfObservation}
                onChange={(e) =>
                  setModeOfObservation(e.target.value as 'In Person' | 'Voice Call' | 'Video Call')
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 bg-white text-slate-800 text-base transition-colors"
              >
                <option value="In Person">In Person</option>
                <option value="Voice Call">Voice Call</option>
                <option value="Video Call">Video Call</option>
              </select>
            </div>
          </div>

          {/* Overall notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Overall notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 resize-none bg-white text-slate-800 text-base transition-colors placeholder:text-slate-400"
              placeholder="Any general observations about today's visit…"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Score reference — compact inline strip */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score reference — tap a number on each question to record your observation</p>
        </div>
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {[
            { score: 1, label: 'Total Assistance', bg: 'bg-peach-blush' },
            { score: 2, label: 'Constant Shared Effort', bg: 'bg-peach-blush/60' },
            { score: 3, label: 'Independent with Support', bg: 'bg-cyan-primary/25' },
            { score: 4, label: 'Independent with Difficulty', bg: 'bg-mint-green/60' },
            { score: 5, label: 'Fully Independent', bg: 'bg-mint-green' },
          ].map(({ score, label, bg }) => (
            <div key={score} className={`${bg} py-3 px-1 text-center`}>
              <div className="text-xl font-bold text-slate-700">{score}</div>
              <div className="text-[10px] font-medium text-slate-600 leading-tight mt-0.5 hidden sm:block">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-4 py-1.5 bg-slate-50 border-t border-slate-100">
          <span className="text-[10px] text-slate-400">More help needed</span>
          <span className="text-[10px] text-slate-400">More independent</span>
        </div>
      </div>

      {/* Category sections */}
      <div className="space-y-5">
        {categories.map((category) => {
          const categoryScored = category.questions.filter(
            (q) => typeof answers[q.id] === 'number'
          ).length
          return (
            <div key={category.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Category header */}
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-base">{category.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {category.type === 'ADL' ? 'Daily Living Activities' : 'Life Skills'}
                    {' · '}
                    <span className={categoryScored > 0 ? 'text-cyan-primary font-medium' : ''}>
                      {categoryScored} of {category.questions.length} scored
                    </span>
                  </p>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-slate-50">
                {category.questions.map((question, qIdx) => {
                  const scored = typeof answers[question.id] === 'number'
                  return (
                    <div
                      key={question.id}
                      className={`px-5 py-4 transition-colors ${scored ? 'bg-slate-50/60' : 'bg-white'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 text-base leading-snug">{question.text}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <ScorePicker
                            value={answers[question.id]}
                            onChange={(val) =>
                              setAnswers((prev) => ({ ...prev, [question.id]: val }))
                            }
                            descriptions={legendMap}
                            ariaLabel={`Score for: ${question.text}`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Category notes */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40">
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Notes for {category.name} <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={categoryNotes[category.id] || ''}
                  onChange={(e) => setCategoryNote(category.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary/20 bg-white text-slate-700 text-sm transition-colors placeholder:text-slate-400 resize-none"
                  placeholder={`Any notes specific to ${category.name}…`}
                  rows={2}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidance if nothing scored yet */}
      {!hasAnyScore && (
        <div className="text-center py-3">
          <p className="text-sm text-slate-400">Select at least one score above to save your observation.</p>
        </div>
      )}

      {/* Error / success feedback */}
      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Bottom action bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm">
        <div className="flex-1 text-sm text-slate-500">
          {lastSavedAt ? (
            <span>Last saved at {formatLastSaved(lastSavedAt)}</span>
          ) : (
            <span>Saves automatically once you've scored at least one item</span>
          )}
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            type="button"
            onClick={onComplete}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving || !canSave}
            className="px-5 py-3 rounded-xl border border-cyan-primary text-cyan-primary font-semibold text-sm hover:bg-cyan-primary/8 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save & Continue'}
          </button>
          <button
            type="submit"
            disabled={isSaving || upsertObservation.isPending || !canSave}
            className="px-5 py-3 rounded-xl bg-cyan-primary text-white font-semibold text-sm hover:bg-cyan-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving || upsertObservation.isPending ? 'Saving…' : (isEditing ? 'Save Changes' : 'Save Observation')}
          </button>
        </div>
      </div>

    </form>
  )
}
