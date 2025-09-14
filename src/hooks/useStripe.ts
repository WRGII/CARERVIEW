// src/hooks/useStripe.ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { getStripePriceId, RETURN_URLS, type PlanKey } from '../config/stripe'

type CreateCheckoutInput = {
  plan: PlanKey
  coupon?: string | null
  successUrl?: string
  cancelUrl?: string
}

type CheckoutResponse = {
  url?: string
  id?: string
  [k: string]: any
}

export const useCreateCheckoutSession = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutInput>({
    mutationFn: async ({ plan, coupon = null, successUrl, cancelUrl }) => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Authentication required')

      // Read the Stripe price ID from env (with helpful errors/warnings)
      const priceId = assertStripeEnv(plan)

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`

      const payload: Record<string, any> = {
        price_id: priceId,
        mode: 'subscription', // all our plans are subscriptions
        success_url:
          successUrl ||
          import.meta.env.VITE_STRIPE_RETURN_SUCCESS ||
          `${window.location.origin}/choose-plan?status=success`,
        cancel_url:
          cancelUrl ||
          import.meta.env.VITE_STRIPE_RETURN_CANCEL ||
          `${window.location.origin}/choose-plan?canceled=1`,
      }
      if (coupon) payload.coupon = coupon

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let msg = `Stripe checkout failed (${res.status})`
        try {
          const err = await res.json()
          if (err?.error) msg = err.error
        } catch {}
        throw new Error(msg)
      }

      const data: CheckoutResponse = await res.json()
      if (data?.url) window.location.href = data.url
      return data
    },
  })
}
