// src/hooks/useObservations.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/** =========================
 * Query: list observations for the current user
 * Back-compat name: useObservations
 * ========================= */
export function useObservations() {
  const { user, profile } = useAuth()

  return useQuery({
    queryKey: ['observations', user?.id],
    enabled: !!user?.id && !!profile,
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('observations')
        .select(
          `
          id,
          user_id,
          resident_name,
          observation_date,
          notes,
          caregiver_name,
          caregiver_email,
          created_at,
          updated_at,
          form_type
        `
        )
        .eq('user_id', user.id)
        .order('observation_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  })
}

/** =========================
 * Fetch a single observation (auth via RLS)
 * IMPORTANT: keep this hook key independent of auth
 * ========================= */
export function useObservationById(id?: string | null) {
  return useQuery({
    queryKey: ['observation', id],   // ← stable key that doesn’t mutate as auth resolves
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase
        .from('observations')
        .select(
          `
          id, user_id, resident_name, observation_date, mode_of_observation, notes, caregiver_name, caregiver_email, created_at, updated_at, form_type, team_id, author_user_id,
          responses:responses (
            id, observation_id, question_id, score, notes, created_at, updated_at,
            question:questions (
              id, question_text, sort_order,
              category:categories ( id, name, type )
            )
          )
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
  })
}

// Back-compat alias: some files import { useObservation }
export { useObservationById as useObservation }

/** =========================
 * Mutation: upsert observation + responses (React Query v5)
 * Export used by ObservationForm
 * ========================= */
type SavePayload = {
  observationId?: string
  observation: {
    resident_name?: string | null
    observation_date: string // YYYY-MM-DD
    mode_of_observation?: string | null
    notes?: string | null
    caregiver_name?: string | null
    caregiver_email?: string | null
    form_type: 'ADL' | 'IADL' | 'COMPREHENSIVE'
  }
  answers: Record<string, number | undefined> // question_id -> score
  categoryNotes: Record<string, string>       // category_id -> note
  questionCategoryMap: Record<string, string> // question_id -> category_id
}

export function useUpsertObservationAndResponses() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (payload: SavePayload) => {
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
        resident_name: observation.resident_name ?? null,
        observation_date: observation.observation_date,
        mode_of_observation: observation.mode_of_observation ?? null,
        notes: observation.notes ?? null,
        caregiver_name: observation.caregiver_name ?? null,
        caregiver_email: observation.caregiver_email ?? null,
        form_type: observation.form_type,
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

      // Prepare response rows — only questions that have a numeric score
      const answeredQuestionIds = Object.entries(answers)
        .filter(([, score]) => typeof score === 'number')
        .map(([question_id]) => question_id)

      const rows = answeredQuestionIds.map((question_id) => {
        const category_id = questionCategoryMap[question_id]
        return {
          observation_id: obsId!,
          question_id,
          score: answers[question_id] as number,
          notes: category_id ? (categoryNotes[category_id] ?? null) : null,
        }
      })

      // On edit: delete responses for questions that were removed from this submission
      // to avoid orphaned rows for questions the user cleared or skipped.
      if (observationId) {
        if (answeredQuestionIds.length === 0) {
          const { error: delAllError } = await supabase
            .from('responses')
            .delete()
            .eq('observation_id', obsId!)
          if (delAllError) throw delAllError
        } else {
          const { data: existing } = await supabase
            .from('responses')
            .select('question_id')
            .eq('observation_id', obsId!)
          const toDelete = (existing ?? [])
            .map((r) => r.question_id as string)
            .filter((qid) => !answeredQuestionIds.includes(qid))
          if (toDelete.length > 0) {
            const { error: delError } = await supabase
              .from('responses')
              .delete()
              .eq('observation_id', obsId!)
              .in('question_id', toDelete)
            if (delError) throw delError
          }
        }
      }

      if (rows.length) {
        const { error } = await supabase
          .from('responses')
          .upsert(rows, { onConflict: 'observation_id,question_id' })
        if (error) throw error
      }

      return { id: obsId! }
    },
  })
}

/** =========================
 * Query: list all observations for a team (used in Memory & Schedule Observations tab)
 * ========================= */
export function useTeamObservations(teamId?: string | null) {
  return useQuery({
    queryKey: ['observations', 'team', teamId],
    enabled: !!teamId,
    queryFn: async () => {
      if (!teamId) return []

      const { data, error } = await supabase
        .from('observations')
        .select(
          `
          id,
          user_id,
          author_user_id,
          resident_name,
          observation_date,
          notes,
          caregiver_name,
          caregiver_email,
          created_at,
          updated_at,
          form_type,
          team_id
        `
        )
        .eq('team_id', teamId)
        .order('observation_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  })
}

/** Optional: delete observation (and cascade responses if FK is ON DELETE CASCADE) */
export function useDeleteObservation() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      const { error } = await supabase.from('observations').delete().eq('id', id)
      if (error) throw error
    },
  })
}
