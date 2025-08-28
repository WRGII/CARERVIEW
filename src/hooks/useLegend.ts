import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

interface Legend {
  id: string
  score: number
  description: string
  created_at: string
}

export const useLegend = () => {
  return useQuery({
    queryKey: ['legend'],
    queryFn: async (): Promise<Legend[]> => {
      const { data, error } = await supabase
        .from('legend')
        .select('*')
        .order('score')

      if (error) {
        throw new Error(`Failed to fetch legend: ${error.message}`)
      }

      return data
    }
  })
}