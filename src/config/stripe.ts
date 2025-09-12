// src/config/stripe.ts

// Supported plan IDs in app + DB
export type PlanKey = 'primary_weekly' | 'occasional_weekly' | 'free';

export const PLANS: Record<
  PlanKey,
  { id: PlanKey; name: string; priceDisplay: string; stripePriceId?: string | null }
> = {
  primary_weekly: {
    id: 'primary_weekly',
    name: 'Primary Caregiver',
    priceDisplay: '$1 / week',
    // set via Vite env: VITE_PRICE_PRIMARY_WEEKLY
    stripePriceId: import.meta.env.VITE_PRICE_PRIMARY_WEEKLY ?? null,
  },
  occasional_weekly: {
    id: 'occasional_weekly',
    name: 'Occasional Caregiver',
    priceDisplay: '$0.50 / week',
    // set via Vite env: VITE_PRICE_OCCASIONAL_WEEKLY
    stripePriceId: import.meta.env.VITE_PRICE_OCCASIONAL_WEEKLY ?? null,
  },
  free: {
    id: 'free',
    name: 'Free',
    priceDisplay: '$0',
    stripePriceId: null, // no Stripe price for Free
  },
};

// Publishable key for client-side Stripe
export const STRIPE_PUBLIC_KEY =
  (import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined) ?? '';

// Return URLs used by checkout
const origin = typeof window !== 'undefined' ? window.location.origin : '';
export const RETURN_URLS = {
  success: `${origin}/caregiver?purchase=success`,
  cancel: `${origin}/choose-plan?purchase=cancelled`,
};

// Helper to safely fetch a plan's price id
export function getStripePriceId(planId: PlanKey): string | null {
  return PLANS[planId]?.stripePriceId ?? null;
}
