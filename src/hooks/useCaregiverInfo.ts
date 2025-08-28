import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface CaregiverInfo {
  display_name: string | null
  email: string | null
}

export const useCaregiverInfo = (tokenId: string | null) => {
  return useQuery({
    queryKey: ['caregiver-info', tokenId],
    queryFn: async (): Promise<CaregiverInfo> => {
      if (!tokenId) {
        throw new Error('No token ID provided')
      }

      const { data, error } = await supabase
        .from('access_tokens')
        .select('display_name, email')
        .eq('id', tokenId)
        .eq('role', 'caregiver')
        .eq('is_active', true)
        .single()

      if (error) {
        throw new Error(`Failed to fetch caregiver info: ${error.message}`)
      }

      return {
        display_name: data.display_name,
        email: data.email
      }
    },
    enabled: !!tokenId
  })
}