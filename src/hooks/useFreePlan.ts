import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export const useActivateFreePlan = () => {
  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(`Authentication error: ${userError.message}`)
      if (!user) throw new Error('You must be signed in to activate free plan')

      const now = new Date()
      const oneYearFromNow = new Date(now)
      oneYearFromNow.setFullYear(now.getFullYear() + 1)

      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_id: `free_${user.id}`,
          plan_id: 'free',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: oneYearFromNow.toISOString(),
          cancel_at_period_end: false,
        }, { onConflict: 'user_id,subscription_id' })
        .select()
        .maybeSingle()

      if (error) throw new Error(`Failed to activate free plan: ${error.message}`)

      return { alreadyActive: false, plan: data }
    },
  })
}
