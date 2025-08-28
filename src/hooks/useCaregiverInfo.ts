import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

interface CaregiverInfo {
  display_name: string | null
  email: string | null
}

export const useCaregiverInfo = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['caregiver-info', user?.id],
    queryFn: async (): Promise<CaregiverInfo> => {
      if (!user || !user.profile) {
        throw new Error('No user or profile available')
      }

      return {
        display_name: user.profile.display_name,
        email: user.email || null
      }
    },
    enabled: !!user && !!user.profile
  })
}