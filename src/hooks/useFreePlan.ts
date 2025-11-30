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

      // Check if user already has an active subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()

      if (existing) {
        return { alreadyActive: true, plan: existing }
      }

      // Create free plan subscription
      const now = new Date()
      const oneYearFromNow = new Date(now)
      oneYearFromNow.setFullYear(now.getFullYear() + 1)

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          subscription_id: `free_${user.id}_${Date.now()}`, // Unique identifier for free subscription
          plan_id: 'free',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: oneYearFromNow.toISOString(),
          cancel_at_period_end: false,
        })
        .select()
        .maybeSingle()

      if (error) throw new Error(`Failed to create free subscription: ${error.message}`)
      if (!data) throw new Error('No data returned from free subscription creation')

      return { alreadyActive: false, plan: data }
    },
  })
}
