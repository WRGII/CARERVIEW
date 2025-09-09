import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

type SavePayload = {
  observationId?: string
  observation: {
    patient_name?: string | null
    observation_date: string // YYYY-MM-DD
    mode_of_observation?: string | null
    notes?: string | null
    caregiver_name?: string | null
    caregiver_email?: string | null
  }
  // question_id -> score (1-5)
  answers: Record<string, number | undefined>
  // category_id -> note text
  categoryNotes: Record<string, string>
  // question_id -> category_id (for mapping notes)
  questionCategoryMap: Record<string, string>
}

export function useUpsertObservationAndResponses() {
  const { user } = useAuth()

  return useMutation(async (payload: SavePayload) => {
    if (!user?.id) throw new Error('Not authenticated')

    const {
      observationId,
      observation,
      answers,
      categoryNotes,
      questionCategoryMap
    } = payload

    // Normalize “observation” columns; DB will set created_at/updated_at
    const base = {
      user_id: user.id,
      patient_name: observation.patient_name ?? null,
      observation_date: observation.observation_date, // YYYY-MM-DD
      mode_of_observation: observation.mode_of_observation ?? null,
      notes: observation.notes ?? null,
      caregiver_name: observation.caregiver_name ?? null,
      caregiver_email: observation.caregiver_email ?? null
    }

    // 1) Insert or update observation and RETURN its id
    let obsId = observationId ?? null

    if (obsId) {
      const { data, error } = await supabase
        .from('observations')
        .update(base)
        .eq('id', obsId)
        .select('id')            // <- IMPORTANT: resolve with id
        .single()

      if (error) throw error
      obsId = data.id
    } else {
      const { data, error } = await supabase
        .from('observations')
        .insert(base)
        .select('id')            // <- IMPORTANT: resolve with id
        .single()

      if (error) throw error
      obsId = data.id
    }

    // 2) Build response rows (skip undefined)
    const rows = Object.entries(answers)
      .filter(([, score]) => typeof score === 'number')
      .map(([question_id, score]) => {
        const category_id = questionCategoryMap[question_id]
        return {
          observation_id: obsId!,
          question_id,
          score: score as number,
          notes: category_id ? (categoryNotes[category_id] ?? null) : null
        }
      })

    // 3) Upsert responses on (observation_id, question_id)
    if (rows.length) {
      const { error } = await supabase
        .from('responses')
        .upsert(rows, { onConflict: 'observation_id,question_id' })

      if (error) throw error
    }

    return { id: obsId! }
  })
}
