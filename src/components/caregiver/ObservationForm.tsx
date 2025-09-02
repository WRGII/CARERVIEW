import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { useLegend } from '../../hooks/useLegend'

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
  const { data: legend, isLoading: legendLoading, error: legendError } = useLegend()
  
  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] = useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({})
  const [dateError, setDateError] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

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

  // Gate the query on auth readiness to avoid “Loading…” hangs
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
    result.sort((a, b) => a.type === b.type ? a.order - b.order : a.type.localeCompare(b.type))
    result.forEach(cat => cat.questions.sort((a, b) => a.order - b.order))
    return result
  }, [categoryQuestions])

  const createObservation = useMutation({
    mutationFn: async (observationData: {
      patientName: string
      observationDate: string              // YYYY-MM-DD
      modeOfObservation: 'In Person' | 'Voice Call' | 'Video Call'
      notes: string
      answers: Record<string, number | undefined>
      categoryNotes: Record<string, string>
    }) => {
      if (!user?.id) throw new Error('You must be signed in to save an observation.')

      // Build caregiver identity
      const caregiver_name =
        (profile?.display_name || '').trim() || profile?.email || user.email || ''
      const caregiver_email = profile?.email || user.email || ''

      // IMPORTANT: Insert ONLY columns that exist on observations.
      // Remove date_of_observation (likely not a column) to avoid 400.
      const { data: obsRow, error: obsError } = await supabase
        .from('observations')
        .insert({
          user_id: user.id,                                 // ✅ RLS
          patient_name: observationData.patientName || null,
          observation_date: observationData.observationDate, // ✅ source of truth date
          mode_of_observation: observationData.modeOfObservation,
          notes: observationData.notes || null,
          caregiver_name,
          caregiver_email
        })
        .select('id')                                       // return PK
        .single()

      if (obsError) {
        // Surface full PostgREST context for debugging
        console.error('Create observation error:', obsError)
        throw new Error(`Create observation failed: ${obsError.message}`)
      }
      if (!obsRow?.id) throw new Error('Observation saved but id was not returned.')

      // Build responses (only selected scores)
      const responses = Object.entries(observationData.answers)
        .filter(([_, score]) => typeof score === 'number')
        .map(([question_id, score]) => {
          // Find which category this question belongs to
          const categoryQuestion = categoryQuestions?.find(cq => cq.question_id === question_id)
          const categoryId = categoryQuestion?.category_id
          const categoryNote = categoryId ? observationData.categoryNotes[categoryId] || '' : ''
          
          return {
            observation_id: obsRow.id,
            question_id,
            score: score as number,
            category_notes: categoryNote
          }
        })

      if (responses.length > 0) {
        const { error: resError } = await supabase.from('responses').insert(responses)
        if (resError) {
          console.error('Create responses error:', resError)
          throw new Error(`Create responses failed: ${resError.message}`)
        }
      }

      return obsRow.id as string
    },
    onMutate: () => setSaveError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
      onComplete()
    },
    onError: (e: any) => {
      console.error('CreateObservation failed:', e)
      setSaveError(e?.message || 'Failed to save observation.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!dateOfObservation) {
      setDateError('Date of observation is required')
      return
    }
    if (!validateDate(dateOfObservation)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)

    // Require at least one score
    const hasAnyScore = Object.values(answers).some(v => typeof v === 'number')
    if (!hasAnyScore) {
      setSaveError('Please select at least one score before saving.')
      return
    }

    createObservation.mutate({
      patientName,
      observationDate: formattedDate,       // YYYY-MM-DD
      modeOfObservation,
      notes,
      answers,
      categoryNotes
    })
  }

  const setScore = (questionId: string, value: string) => {
    const score = value === '' ? undefined : Number(value)
    setAnswers(prev => ({ ...prev, [questionId]: score }))
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
      <div className="bg-white border rounded-xl">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-900">Score Reference</h3>
        </div>
        <div className="p-4">
          {legendLoading ? (
            <div className="text-slate-500 text-center py-4">Loading score reference...</div>
          ) : legendError ? (
            <div className="text-red-600 text-center py-4">Failed to load score reference</div>
          ) : legend && legend.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Scores 0-5 */}
              <div className="space-y-2">
                {legend
                  .filter(item => item.score <= 5)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1">
                      <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-sm font-semibold ${
                        item.score >= 4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.score}
                      </span>
                      <span className="text-slate-700 text-sm flex-1 ml-3">{item.description}</span>
                    </div>
                  ))}
              </div>
              
              {/* Right Column: Scores 6-10 */}
              <div className="space-y-2">
                {legend
                  .filter(item => item.score >= 6)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between py-1">
                      <span className={`inline-flex items-center justify-center w-8 h-6 rounded text-sm font-semibold ${
                        item.score >= 7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.score}
                      </span>
                      <span className="text-slate-700 text-sm flex-1 ml-3">{item.description}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-4">No score reference available</div>
          )}
        </div>
      </div>

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
                      <select
                        value={answers[question.id] ?? ''}
                        onChange={(e) => setScore(question.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select score...</option>
                        {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
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
        <Button type="submit" disabled={createObservation.isPending} variant="primary">
          {createObservation.isPending ? 'Saving...' : 'Create Observation'}
        </Button>
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
      </div>

      {/* Inline save error */}
      {saveError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}
    </form>
  )
}
