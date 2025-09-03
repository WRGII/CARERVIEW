import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/** ---------- Types (local) ---------- */

export interface Observation {
  id: string
  user_id: string
  patient_name: string
  observation_date: string            // YYYY-MM-DD (source of truth date)
  // date_of_observation: string      // ⛔️ remove/avoid using duplicate date field
  mode_of_observation: 'In Person' | 'Voice Call' | 'Video Call'
  notes: string
  caregiver_name: string
  caregiver_email: string
  created_at: string
  updated_at: string
}

export interface ObservationWithResponses extends Observation {
  responses: any[]
}

export interface NewResponseRow {
  question_id: string
  score: number
  notes?: string
}

/** ---------- Queries ---------- */

export const useObservations = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['observations'],
    enabled: !!user?.id,
    queryFn: async (): Promise<Observation[]> => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('user_id', user.id)
        .order('observation_date', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch observations: ${error.message}`)
      }
      return (data ?? []) as Observation[]
    },
  })
}

export const useObservation = (id: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['observation', id],
    enabled: !!id && !!user?.id,
    queryFn: async (): Promise<ObservationWithResponses> => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data: observation, error: obsError } = await supabase
        .from('observations')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (obsError) {
        throw new Error(`Failed to fetch observation: ${obsError.message}`)
      }

      const { data: responses, error: resError } = await supabase
        .from('responses')
        .select(`
          *,
          question:questions(*,
            category:categories(*)
          )
        `)
        .eq('observation_id', id)

      if (resError) {
        throw new Error(`Failed to fetch responses: ${resError.message}`)
      }

      return { ...(observation as Observation), responses: (responses ?? []) as any[] }
    },
  })
}

/** ---------- Mutations ---------- */

/**
 * Creates an observation ONLY.
 * Use this if you handle responses elsewhere.
 */
export const useCreateObservation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (observation: Partial<Observation>) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Ensure the required fields are present and well-formed
      const observation_date =
        typeof observation.observation_date === 'string'
          ? observation.observation_date
          : new Date().toISOString().slice(0, 10) // fallback (today) if caller omitted it

      const payload = {
        patient_name: (observation.patient_name ?? '').trim() || 'Unnamed Patient',
        observation_date, // source-of-truth date column
        mode_of_observation: (observation.mode_of_observation as Observation['mode_of_observation']) ?? 'In Person',
        notes: observation.notes ?? '',
        caregiver_name: observation.caregiver_name ?? '',
        caregiver_email: observation.caregiver_email ?? '',
        user_id: user.id, // ✅ critical for RLS
      }

      const { data, error } = await supabase
        .from('observations')
        .insert(payload)
        .select('id, patient_name, observation_date, mode_of_observation, notes, caregiver_name, caregiver_email, user_id, created_at, updated_at')
        .single()

      if (error) throw new Error(`Failed to create observation: ${error.message}`)
      return data as Observation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
    },
  })
}

/**
 * Creates an observation AND its responses in one flow.
 * Pass responses as [{ question_id, score, notes? }, ...]
 */
export const useCreateObservationWithResponses = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (args: {
      observation: Partial<Observation>
      responses: NewResponseRow[]
    }) => {
      const { observation, responses } = args
      if (!user?.id) throw new Error('User not authenticated')

      if (!responses || responses.length === 0) {
        throw new Error('Please provide at least one response.')
      }

      // Normalize/validate keys for insert
      const observation_date =
        typeof observation.observation_date === 'string'
          ? observation.observation_date
          : new Date().toISOString().slice(0, 10)

      const obsPayload = {
        patient_name: (observation.patient_name ?? '').trim() || 'Unnamed Patient',
        observation_date,
        mode_of_observation: (observation.mode_of_observation as Observation['mode_of_observation']) ?? 'In Person',
        notes: observation.notes ?? '',
        caregiver_name: observation.caregiver_name ?? '',
        caregiver_email: observation.caregiver_email ?? '',
        user_id: user.id, // ✅ needed for RLS
      }

      // 1) Insert observation and return id
      const { data: obsRow, error: obsErr } = await supabase
        .from('observations')
        .insert(obsPayload)
        .select('id')
        .single()

      if (obsErr) throw new Error(`Failed to create observation: ${obsErr.message}`)
      if (!obsRow?.id) throw new Error('Observation saved but id was not returned.')

      // 2) Bulk-insert responses linked to this observation
      const responseRows = responses.map((r) => ({
        observation_id: obsRow.id,
        question_id: r.question_id,
        score: r.score,
        notes: r.notes ?? '',
      }))

      const { error: respErr } = await supabase.from('responses').insert(responseRows)
      if (respErr) {
        // Optional: clean up orphan observation if responses fail
        // await supabase.from('observations').delete().eq('id', obsRow.id)
        throw new Error(`Failed to save responses: ${respErr.message}`)
      }

      return { id: obsRow.id }
    },
    onSuccess: () => {
      // Refresh lists and any detail views
      queryClient.invalidateQueries({ queryKey: ['observations'] })
    },
  })
}

export const useUpsertObservationAndResponses = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (args: {
      observationId?: string
      observation: Partial<Observation>
      answers: Record<string, number | undefined>
      categoryNotes: Record<string, string>
      questionCategoryMap: Record<string, string>
    }) => {
      const { observationId, observation, answers, categoryNotes, questionCategoryMap } = args
      if (!user?.id) throw new Error('User not authenticated')

      // Normalize/validate keys for upsert
      const observation_date =
        typeof observation.observation_date === 'string'
          ? observation.observation_date
          : new Date().toISOString().slice(0, 10)

      const obsPayload = {
        patient_name: (observation.patient_name ?? '').trim() || 'Unnamed Patient',
        observation_date,
        mode_of_observation: (observation.mode_of_observation as Observation['mode_of_observation']) ?? 'In Person',
        notes: observation.notes ?? '',
        caregiver_name: observation.caregiver_name ?? '',
        caregiver_email: observation.caregiver_email ?? '',
        user_id: user.id,
      }

      let finalObservationId: string

      if (observationId) {
        // Update existing observation
        const { data: obsRow, error: obsErr } = await supabase
          .from('observations')
          .update(obsPayload)
          .eq('id', observationId)
          .eq('user_id', user.id)
          .select('id')
          .single()

        if (obsErr) throw new Error(`Failed to update observation: ${obsErr.message}`)
        if (!obsRow?.id) throw new Error('Observation updated but id was not returned.')
        finalObservationId = obsRow.id
      } else {
        // Create new observation
        const { data: obsRow, error: obsErr } = await supabase
          .from('observations')
          .insert(obsPayload)
          .select('id')
          .single()

        if (obsErr) throw new Error(`Failed to create observation: ${obsErr.message}`)
        if (!obsRow?.id) throw new Error('Observation saved but id was not returned.')
        finalObservationId = obsRow.id
      }

      // Prepare responses for upsert
      const responseRows = Object.entries(answers)
        .filter(([_, score]) => typeof score === 'number')
        .map(([question_id, score]) => {
          const category_id = questionCategoryMap[question_id]
          const category_notes = category_id ? categoryNotes[category_id] || '' : ''
          
          return {
            observation_id: finalObservationId,
            question_id,
            score: score as number,
            notes: '',
            category_notes
          }
        })

      if (responseRows.length > 0) {
        const { error: respErr } = await supabase
          .from('responses')
          .upsert(responseRows, {
            onConflict: 'observation_id,question_id'
          })

        if (respErr) {
          throw new Error(`Failed to save responses: ${respErr.message}`)
        }
      }

      return { id: finalObservationId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
    },
  })
}

export const useUpdateObservation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Observation> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('observations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, patient_name, observation_date, mode_of_observation, notes, caregiver_name, caregiver_email, user_id, created_at, updated_at')
        .single()

      if (error) {
        throw new Error(`Failed to update observation: ${error.message}`)
      }

      return data as Observation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
      queryClient.invalidateQueries({ queryKey: ['observation', data.id] })
    },
  })
}
