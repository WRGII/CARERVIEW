import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

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
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  
  const [patientName, setPatientName] = useState('')
  const [dateOfObservation, setDateOfObservation] = useState('')
  const [modeOfObservation, setModeOfObservation] = useState<'In Person' | 'Voice Call' | 'Video Call'>('In Person')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})
  const [dateError, setDateError] = useState('')

  // Date validation function
  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false
    
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
    if (!dateRegex.test(dateString)) return false
    
    const [month, day, year] = dateString.split('/').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day
  }

  const handleDateChange = (value: string) => {
    setDateOfObservation(value)
    if (value && !validateDate(value)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
    } else {
      setDateError('')
    }
  }

  // Convert MM/DD/YYYY to YYYY-MM-DD for database
  const formatDateForDB = (dateString: string): string => {
    if (!dateString || !validateDate(dateString)) return ''
    const [month, day, year] = dateString.split('/').map(Number)
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  const { data: categoryQuestions, isLoading, error } = useQuery({
    queryKey: ['category-questions'],
    queryFn: async (): Promise<CategoryQuestion[]> => {
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

  // Transform data into categories with questions
  const categories: Category[] = React.useMemo(() => {
    if (!categoryQuestions) return []
    
    const categoryMap = new Map<string, Category>()
    
    categoryQuestions.forEach(item => {
      if (!categoryMap.has(item.category_id)) {
        categoryMap.set(item.category_id, {
          id: item.category_id,
          name: item.category_name,
          type: item.type,
          order: item.category_order,
          questions: []
        })
      }
      
      categoryMap.get(item.category_id)!.questions.push({
        id: item.question_id,
        text: item.question_text,
        order: item.question_order
      })
    })
    
    const result = Array.from(categoryMap.values())
    result.sort((a, b) => a.type === b.type ? a.order - b.order : a.type.localeCompare(b.type))
    result.forEach(cat => cat.questions.sort((a, b) => a.order - b.order))
    
    return result
  }, [categoryQuestions])

  const createObservation = useMutation({
    mutationFn: async (observationData: any) => {
      if (!user) throw new Error('User not authenticated')

      // Create observation with user.id
      const { data: observation, error: obsError } = await supabase
        .from('observations')
        .insert({
          user_id: user.id,
          patient_name: observationData.patientName || null,
          observation_date: observationData.observationDate,
          date_of_observation: observationData.observationDate,
          mode_of_observation: observationData.modeOfObservation,
          notes: observationData.notes || null,
          caregiver_name: user.profile?.display_name || '',
          caregiver_email: user.email || ''
        })
        .select()
        .single()

      if (obsError) throw obsError

      // Create responses for selected scores
      const responses = Object.entries(observationData.answers)
        .filter(([_, score]) => typeof score === 'number')
        .map(([questionId, score]) => ({
          observation_id: observation.id,
          question_id: questionId,
          score: score as number
        }))

      if (responses.length > 0) {
        const { error: resError } = await supabase
          .from('responses')
          .insert(responses)

        if (resError) throw resError
      }

      return observation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
      onComplete()
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dateOfObservation) {
      setDateError('Date of observation is required')
      return
    }
    
    if (!validateDate(dateOfObservation)) {
      setDateError('Please enter a valid date in MM/DD/YYYY format')
      return
    }

    const formattedDate = formatDateForDB(dateOfObservation)
    
    createObservation.mutate({
      patientName,
      observationDate: formattedDate,
      modeOfObservation,
      notes,
      answers
    })
  }

  const setScore = (questionId: string, value: string) => {
    const score = value === '' ? undefined : Number(value)
    setAnswers(prev => ({ ...prev, [questionId]: score }))
  }

  if (isLoading) {
    return <div className="text-slate-500 bg-white border rounded-xl p-4">Loading questions...</div>
  }

  if (error) {
    return <div className="text-red-700 bg-white border rounded-xl p-4">Error: {error.message}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Observation</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Patient Name
            </label>
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
            {dateError && (
              <p className="text-red-600 text-sm mt-1">{dateError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mode of Observation
            </label>
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
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any notes"
              rows={3}
            />
          </div>
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
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={createObservation.isPending}
          variant="primary"
        >
          {createObservation.isPending ? 'Saving...' : 'Create Observation'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onComplete}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}