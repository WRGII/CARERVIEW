import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { establishSessionFromToken } from '../../lib/tokenSession'

type Row = {
  category_id: string
  category_name: string
  type: 'ADL' | 'IADL'
  category_order: number
  question_id: string
  question_order: number
  question_text: string
}

type Cat = {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  order: number
  questions: { id: string; text: string; order: number }[]
}

export default function ObservationForm() {
  // Ensure DB RLS context is set from the token before querying
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await establishSessionFromToken() // validates token + calls app.set_token_context
        if (mounted) setReady(true)
      } catch {
        if (mounted) setReady(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const [patientName, setPatientName] = useState('')
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({})

  const { data, isLoading, error } = useQuery({
    queryKey: ['v_category_questions'],
    enabled: ready, // ← don’t run until session context is ready
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_category_questions')
        .select(
          'category_id,category_name,type,category_order,question_id,question_order,question_text'
        )
        .order('type', { ascending: true })
        .order('category_order', { ascending: true })
        .order('question_order', { ascending: true })
      if (error) throw new Error(error.message)
      return (data || []) as Row[]
    },
  })

  const cats = useMemo<Cat[]>(() => {
    const map = new Map<string, Cat>()
    ;(data || []).forEach(r => {
      if (!map.has(r.category_id)) {
        map.set(r.category_id, {
          id: r.category_id,
          name: r.category_name,
          type: r.type,
          order: r.category_order ?? 0,
          questions: [],
        })
      }
      map.get(r.category_id)!.questions.push({
        id: r.question_id,
        text: r.question_text,
        order: r.question_order ?? 0,
      })
    })
    const arr = Array.from(map.values())
    arr.sort((a, b) => (a.type === b.type ? a.order - b.order : a.type.localeCompare(b.type)))
    arr.forEach(c => c.questions.sort((a, b) => a.order - b.order))
    return arr
  }, [data])

  function setScore(qid: string, val: string) {
    const v = val === '' ? undefined : Number(val)
    setAnswers(prev => ({ ...prev, [qid]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 1) Create observation
    const { data: obs, error: oErr } = await supabase
      .from('observations')
      .insert([{ patient_name: patientName || null, notes:_]()
