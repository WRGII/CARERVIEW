import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Observation, ObservationWithResponses } from '../lib/supabase'

export const useObservations = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['observations'],
    queryFn: async (): Promise<Observation[]> => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('user_id', user.id)
        .order('observation_date', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch observations: ${error.message}`)
      }

      return data
    },
    enabled: !!user
  })
}

export const useObservation = (id: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['observation', id],
    queryFn: async (): Promise<ObservationWithResponses> => {
      if (!user) throw new Error('User not authenticated')
      
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

      return {
        ...observation,
        responses: responses as any
      }
    },
    enabled: !!id && !!user
  })
}

export const useCreateObservation = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (observation: Partial<Observation>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('observations')
        .insert({
          ...observation,
          user_id: user.id
        })
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
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Observation> & { id: string }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('observations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
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