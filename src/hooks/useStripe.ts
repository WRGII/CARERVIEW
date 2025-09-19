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
      if (sessionError) throw sessionError
      if (!session?.access_token) throw new Error('Authentication required')

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          promotionCode: promotionCode || null,
          success_url: successUrl ?? RETURN_URLS.success,
          cancel_url: cancelUrl ?? RETURN_URLS.cancel,
        },
      })

      if (error) throw new Error(error.message || 'Failed to start checkout')
      // If a URL is returned, you can redirect here or let the caller do it
      if (data?.url) window.location.assign(data.url as string)
      return data as CheckoutResponse
    },
  })
}
