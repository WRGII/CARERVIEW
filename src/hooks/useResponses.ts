import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Response } from '../lib/supabase'

export const useSaveResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (response: Partial<Response>) => {
      const { data, error } = await supabase
        .from('responses')
        .upsert({
          ...response,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save response: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['observation', data.observation_id] })
    }
  })
}

export const useSaveBulkResponses = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (responses: Partial<Response>[]) => {
      const { data, error } = await supabase
        .from('responses')
        .upsert(responses.map(r => ({
          ...r,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) {
        throw new Error(`Failed to save responses: ${error.message}`)
      }

      return data
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['observation', data[0].observation_id] })
      }
    }
  })
}