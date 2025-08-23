import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Observation, ObservationWithResponses } from '../lib/supabase'

export const useObservations = () => {
  return useQuery({
    queryKey: ['observations'],
    queryFn: async (): Promise<Observation[]> => {
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .order('observation_date', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch observations: ${error.message}`)
      }

      return data
    }
  })
}

export const useObservation = (id: string) => {
  return useQuery({
    queryKey: ['observation', id],
    queryFn: async (): Promise<ObservationWithResponses> => {
      const { data: observation, error: obsError } = await supabase
        .from('observations')
        .select('*')
        .eq('id', id)
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

      return {
        ...observation,
        responses: responses as any
      }
    },
    enabled: !!id
  })
}

export const useCreateObservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (observation: Partial<Observation>) => {
      const { data, error } = await supabase
        .from('observations')
        .insert(observation)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create observation: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
    }
  })
}

export const useUpdateObservation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Observation> & { id: string }) => {
      const { data, error } = await supabase
        .from('observations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update observation: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['observations'] })
      queryClient.invalidateQueries({ queryKey: ['observation', data.id] })
    }
  })
}