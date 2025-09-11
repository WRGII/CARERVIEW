// src/hooks/useStripe.ts
import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { STRIPE_PRODUCTS, type ProductKey } from '../stripe-config'

interface CreateCheckoutSessionParams {
  productKey: ProductKey
  successUrl?: string
  cancelUrl?: string
}

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async ({ productKey, successUrl, cancelUrl }: CreateCheckoutSessionParams) => {
      const product = STRIPE_PRODUCTS[productKey]
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required')
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          mode: product.mode,
          success_url: successUrl || `${window.location.origin}/caregiver?success=true`,
          cancel_url: cancelUrl || `${window.location.origin}/choose-plan?canceled=true`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      
      if (data.url) {
        window.location.href = data.url
      }
      
      return data
    }
  })
}