import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { RETURN_URLS } from '../config/stripe'

type CreateCheckoutArgs = {
  priceId: string
  promotionCode?: string | null
  successUrl?: string
  cancelUrl?: string
}

type CheckoutResponse = {
  url?: string
  id?: string
  [k: string]: any
}

export const useCreateCheckoutSession = () => {
  return useMutation<CheckoutResponse, Error, CreateCheckoutArgs>({
    mutationFn: async ({ priceId, promotionCode = null, successUrl, cancelUrl }) => {
      if (!priceId) {
        throw new Error('Price ID is required')
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError) throw new Error(`Authentication error: ${sessionError.message}`)
      if (!session?.access_token) throw new Error('You must be signed in to checkout')

      try {
        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: {
            price_id: priceId,
            promotionCode: promotionCode || null,
            success_url: successUrl ?? RETURN_URLS.success,
            cancel_url: cancelUrl ?? RETURN_URLS.cancel,
          },
        })

        if (error) {
          console.error('Checkout error:', error)
          throw new Error(error.message || 'Failed to start checkout session')
        }

        if (!data) {
          throw new Error('No response from checkout service')
        }

        if (!data.url) {
          throw new Error('Checkout session created but no redirect URL received')
        }

        // Redirect to Stripe checkout
        window.location.assign(data.url as string)
        return data as CheckoutResponse
      } catch (err: any) {
        console.error('Stripe checkout failed:', err)
        throw new Error(err.message || 'Unable to start checkout. Please try again.')
      }
    },
  })
}
