// src/stripe-config.ts
export const STRIPE_PRODUCTS = {
  occasional: {
    priceId: 'price_occasional_caregiver', // Replace with actual Stripe price ID
    name: 'CarerView Occasional Caregiver',
    description: 'CarerView subscriptions for the occasion caregiver providing one (1) CarerView Observation each week.',
    price: 0.50,
    mode: 'subscription' as const
  },
  primary: {
    priceId: 'price_primary_caregiver', // Replace with actual Stripe price ID
    name: 'CareView Primary Caregiver', 
    description: 'CarerView subscription for primary caregivers providing up to seven (7) CarerView Observations each week.',
    price: 1.00,
    mode: 'subscription' as const
  }
} as const

export type ProductKey = keyof typeof STRIPE_PRODUCTS