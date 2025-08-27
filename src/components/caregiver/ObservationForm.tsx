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
      .insert([{ patient_name: patientName || null, notes: notes || null }])
      .select('id')
      .single()
    if (oErr) { alert(oErr.message); return }
    const observationId = obs.id as string

    // 2) Insert responses for answered questions
    const rows: { observation_id: string; question_id: string; score: number }[] = []
    for (const [qid, score] of Object.entries(answers)) {
      if (typeof score === 'number') rows.push({ observation_id: observationId, question_id: qid, score })
    }
    if (rows.length > 0) {
      const { error: rErr } = await supabase.from('responses').insert(rows)
      if (rErr) { alert(rErr.message); return }
    }

    // 3) Back to caregiver dashboard (keep token)
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token') || ''
    window.location.href = `/caregiver?token=${encodeURIComponent(token)}`
  }

  if (!ready) {
    return (
      <div className="text-slate-500 bg-white border rounded-xl p-4">
        Preparing secure session…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Observation</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name (Optional)</label>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
              placeholder="Enter any notes"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading && <div className="text-slate-500">Loading questions…</div>}
        {error && <div className="text-red-700">Error: {(error as any).message}</div>}
        {!isLoading && !error && cats.map(cat => (
          <div key={cat.id} className="bg-white border rounded-xl">
            <div className="px-4 py-3 border-b bg-slate-50">
              <div className="font-semibold text-slate-900">
                {cat.name} <span className="text-slate-500 text-sm">({cat.type})</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {cat.questions.map(q => (
                  <div key={q.id} className="grid md:grid-cols-12 items-center gap-3">
                    <div className="md:col-span-9 text-slate-800">{q.text}</div>
                    <div className="md:col-span-3">
                      <select
                        value={answers[q.id] ?? ''}
                        onChange={(e) => setScore(q.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border"
                      >
                        <option value="">Select score…</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n}</option>
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
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Create Observation
        </button>
        <a
          href={`/caregiver${window.location.search}`}
          className="px-4 py-2 rounded-lg border hover:bg-slate-50"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
