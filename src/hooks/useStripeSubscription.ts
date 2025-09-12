import { useQuery } from '@tanstack/react-query'
import { supabasePublic } from '@/lib/supabaseClient'

type StripeSub = {
  user_id: string
  subscription_id: string | null
  status: string | null
  price_id: string | null
  current_period_end: number | null
  cancel_at_period_end: boolean | null
}

export function useStripeSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: ['stripe_subscription', userId],
    enabled: !!userId,
    queryFn: async (): Promise<StripeSub | null> => {
      if (!userId) return null
      const { data, error } = await supabasePublic
        .from('stripe_subscriptions')
        .select('user_id, subscription_id, status, price_id, current_period_end, cancel_at_period_end')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
