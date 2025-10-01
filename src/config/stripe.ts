// src/config/stripe.ts

// Keys your UI and hooks will use for plan selection
export type PlanKey = 'primary_weekly' | 'occasional_weekly'

// Display metadata with actual Stripe product information
export const PLANS: Record<
  PlanKey,
  {
    label: string
    blurb: string
    mode: 'subscription'
    productId: string
    priceId: string
    price: number // in cents
    description: string
  }
> = {
  occasional_weekly: {
    label: 'CarerView Occasional Caregiver',
    blurb: '1 observation / week',
    mode: 'subscription',
    productId: 'prod_T2OOrK0MXVPaEh',
    priceId: 'price_1S6JbcGiqZeZmBYJuzntoZ9d',
    price: 50, // $0.50 in cents
    description:
      'CarerView subscriptions for the occasion caregiver providing one (1) CarerView Observation each week.',
  },
  primary_weekly: {
    label: 'CarerView Primary Caregiver',
    blurb: '7 observations / week',
    mode: 'subscription',
    productId: 'prod_T2OMjy9HcKhTjW',
    priceId: 'price_1S6JaCGiqZeZmBYJxGwZtSqL',
    price: 100, // $1.00 in cents
    description:
      'CarerView subscription for primary caregivers providing up to seven (7) CarerView Observations each week.',
  },
}

// Compute a safe origin (Vite only exposes VITE_* to the client)
const ORIGIN =
  (typeof window !== 'undefined' && window.location?.origin) ||
  (import.meta.env.VITE_PUBLIC_SITE_URL as string) ||
  (import.meta.env.VITE_SITE_URL as string) ||
  ''

// Return URLs (env can override). Defaults must include {CHECKOUT_SESSION_ID}.
export const RETURN_URLS = {
  success:
    (import.meta.env.VITE_STRIPE_RETURN_SUCCESS as string) ||
    `${ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel:
    (import.meta.env.VITE_STRIPE_RETURN_CANCEL as string) ||
    `${ORIGIN}/choose-plan?canceled=1`,
}

/** Get the Stripe Price ID for a plan */
export function getStripePriceId(plan: PlanKey): string {
  return PLANS[plan].priceId
}

/** Format price for display */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
