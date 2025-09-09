import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/** =========================
 * Query: list observations for the current user
 * Back-compat name: useObservations
 * ========================= */
export function useObservations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['observations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('observations')
        .select(
          `
          id,
          user_id,
          patient_name,
          observation_date,
          notes,
          caregiver_name,
          caregiver_email,
          created_at,
          updated_at
        `
        )
        .eq('user_id', user.id)
        .order('observation_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    staleTime: 60_000,
  })
}

/** Optional: fetch a single observation with nested responses (handy for ViewObservation) */
export function useObservationById(id?: string | null) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['observation', user?.id, id],
    enabled: !!user?.id && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('observations')
        .select(
          `
          id, user_id, patient_name, observation_date, notes, caregiver_name, caregiver_email, created_at, updated_at,
          responses:responses (
            id, observation_id, question_id, score, notes, created_at, updated_at,
            question:questions (
              id, question_text, sort_order,
              category:categories ( id, name, type )
            )
          )
        `
        )
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
  })
}

/** =========================
 * Mutation: upsert observation + responses
 * Export used by ObservationForm
 * ========================= */
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
  answers: Record<string, number | undefined>              // question_id -> score
  categoryNotes: Record<string, string>                    // category_id -> note
  questionCategoryMap: Record<string, string>              // question_id -> category_id
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
      questionCategoryMap,
    } = payload

    const base = {
      user_id: user.id,
      patient_name: observation.patient_name ?? null,
      observation_date: observation.observation_date,
      mode_of_observation: observation.mode_of_observation ?? null,
      notes: observation.notes ?? null,
      caregiver_name: observation.caregiver_name ?? null,
      caregiver_email: observation.caregiver_email ?? null,
    }

    // Insert or update observation and return its id
    let obsId = observationId ?? null

    if (obsId) {
      const { data, error } = await supabase
        .from('observations')
        .update(base)
        .eq('id', obsId)
        .select('id')
        .single()
      if (error) throw error
      obsId = data.id
    } else {
      const { data, error } = await supabase
        .from('observations')
        .insert(base)
        .select('id')
        .single()
      if (error) throw error
      obsId = data.id
    }

    // Prepare response rows
    const rows = Object.entries(answers)
      .filter(([, score]) => typeof score === 'number')
      .map(([question_id, score]) => {
        const category_id = questionCategoryMap[question_id]
        return {
          observation_id: obsId!,
          question_id,
          score: score as number,
          notes: category_id ? (categoryNotes[category_id] ?? null) : null,
        }
      })

    if (rows.length) {
      const { error } = await supabase
        .from('responses')
        .upsert(rows, { onConflict: 'observation_id,question_id' })
      if (error) throw error
    }

    return { id: obsId! }
  })
}
// Back-compat alias: some files import { useObservation }
export { useObservationById as useObservation };

/** Optional: delete observation (and cascade responses if FK is ON DELETE CASCADE) */
export function useDeleteObservation() {
  const { user } = useAuth()
  return useMutation(async (id: string) => {
    if (!user?.id) throw new Error('Not authenticated')
    const { error } = await supabase.from('observations').delete().eq('id', id)
    if (error) throw error
  })
}
