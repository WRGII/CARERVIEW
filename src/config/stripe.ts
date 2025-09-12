// src/config/stripe.ts

// Keys your UI and hooks will use for plan selection
export type PlanKey = 'primary_weekly' | 'occasional_weekly' | 'free';

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
};

// Return URLs (can be overridden by env). Do not hard-fail if unset;
export const RETURN_URLS = {
  success:
    import.meta.env.VITE_STRIPE_RETURN_SUCCESS ||
    `${window.location.origin}/caregiver?success=true`,
  cancel:
    import.meta.env.VITE_STRIPE_RETURN_CANCEL ||
    `${window.location.origin}/choose-plan?canceled=true`,
};

/**
 * Pull the correct Stripe Price ID for a plan from env (Vite injects VITE_* at build).
 * Returns null for "free" or if the env var is not set.
 */
export function getStripePriceId(plan: PlanKey): string | null {
  switch (plan) {
    case 'primary_weekly':
      return import.meta.env.VITE_STRIPE_PRICE_PRIMARY_WEEKLY || null;
    case 'occasional_weekly':
      return import.meta.env.VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY || null;
    case 'free':
      return null;
    default:
      return null;
  }
}
