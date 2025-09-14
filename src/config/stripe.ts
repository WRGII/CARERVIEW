// src/config/stripe.ts

// Keys your UI and hooks will use for plan selection
export type PlanKey = 'primary_weekly' | 'occasional_weekly' | 'free'

// Display metadata only — no secrets here
export const PLANS: Record<
  PlanKey,
  { label: string; blurb: string; mode: 'subscription' | 'none' }
> = {
  primary_weekly: {
    label: 'Primary Caregiver',
    blurb: '7 observations / week',
    mode: 'subscription',
  },
  occasional_weekly: {
    label: 'Occasional Caregiver',
    blurb: '1 observation / week',
    mode: 'subscription',
  },
  free: {
    label: 'Free',
    blurb: '3 total in first 30 days',
    mode: 'none',
  },
}

// Use window origin in the browser; fall back to PUBLIC_SITE_URL at build
const ORIGIN =
  (typeof window !== 'undefined' && window.location?.origin) ||
  (import.meta.env.PUBLIC_SITE_URL as string) ||
  ''

// Return URLs (env can override). Keep defaults aligned with the new flow.
export const RETURN_URLS = {
  success:
    import.meta.env.VITE_STRIPE_RETURN_SUCCESS ||
    `${ORIGIN}/caregiver`,
  cancel:
    import.meta.env.VITE_STRIPE_RETURN_CANCEL ||
    `${ORIGIN}/create-account?canceled=1`,
}

/**
 * Lookup the Stripe Price ID for a plan from env (Vite injects VITE_* at build).
 * Returns null for "free" (no checkout) or if the env var is not set.
 */
export function getStripePriceId(plan: PlanKey): string | null {
  switch (plan) {
    case 'primary_weekly':
      return import.meta.env.VITE_STRIPE_PRICE_PRIMARY_WEEKLY || null
    case 'occasional_weekly':
      return import.meta.env.VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY || null
    case 'free':
      return null
    default:
      return null
  }
}
