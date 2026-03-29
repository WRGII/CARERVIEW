import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

async function ensureStripeCustomer(): Promise<void> {
  const { error } = await supabase.functions.invoke('stripe-ensure-customer', { body: {} })
  if (error) {
    console.warn('[useFreePlan] stripe-ensure-customer non-fatal error:', error.message)
  }
}

export const useActivateFreePlan = () => {
  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(`Authentication error: ${userError.message}`)
      if (!user) throw new Error('You must be signed in to activate free plan')

      const { data: existing, error: checkErr } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_id, status, current_period_end')
        .eq('user_id', user.id)
        .eq('subscription_id', `free_${user.id}`)
        .maybeSingle()

      if (checkErr) throw new Error(`Failed to check existing plan: ${checkErr.message}`)

      if (existing && existing.status === 'active') {
        const end = existing.current_period_end ? Date.parse(existing.current_period_end as string) : 0
        if (end > Date.now()) {
          return { alreadyActive: true, plan: existing }
        }
      }

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

      await ensureStripeCustomer()

      return { alreadyActive: false, plan: data }
    },
  })
}
