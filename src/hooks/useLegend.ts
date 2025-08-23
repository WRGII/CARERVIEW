import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Legend } from '../lib/supabase'

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