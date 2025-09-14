// src/hooks/useStripe.ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { getStripePriceId, RETURN_URLS, type PlanKey } from '../config/stripe'

type CreateCheckoutArgs = {
  plan: PlanKey
  coupon?: string | null        // optional user-entered promo code
  successUrl?: string
  cancelUrl?: string
}

type CheckoutResponse = {
  url?: string
  skip?: true
}

export const useCreateCheckoutSession = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutArgs>({
    mutationFn: async ({ plan, coupon = null, successUrl, cancelUrl }) => {
      // Ensure the user is authenticated (so the function can attach user_id)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Authentication required')

      // Resolve Stripe Price ID for the chosen plan
      const priceId = getStripePriceId(plan)

      // Free plan → nothing to purchase, let caller skip checkout
      if (!priceId) {
        return { skip: true as const }
      }

      // Call the Supabase Edge Function that creates a Checkout Session
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          plan_key: plan,
          promotionCode: coupon || null,                 // server resolves to a Promotion Code
          success_url: successUrl ?? RETURN_URLS.success,
          cancel_url:  cancelUrl  ?? RETURN_URLS.cancel,
        },
      })

      if (error) throw error
      if (!data?.url) throw new Error('Unable to start Stripe Checkout')

      // Redirect to Stripe Checkout
      window.location.assign(data.url as string)
      return data as CheckoutResponse
    },
  })
}
