// src/stripe-config.ts
export type PlanKey = 'primary_weekly' | 'occasional_weekly';

type ProductConfig = {
  priceId: string;
  name: string;
  interval: 'week';
  currency: 'usd';
};

// Read env once, trim, and support legacy names for safety.
const ENV = import.meta.env as Record<string, string | undefined>;

const PRIMARY_WEEKLY =
  (ENV.VITE_STRIPE_PRICE_PRIMARY_WEEKLY ??
    ENV.VITE_STRIPE_PRICE_PRIMARY)?.trim() || '';

const OCCASIONAL_WEEKLY =
  (ENV.VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY ??
    ENV.VITE_STRIPE_PRICE_OCCASIONAL)?.trim() || '';

export const STRIPE_CONFIG: Record<PlanKey, ProductConfig> = {
  primary_weekly: {
    priceId: PRIMARY_WEEKLY,
    name: 'Primary Caregiver',
    interval: 'week',
    currency: 'usd',
  },
  occasional_weekly: {
    priceId: OCCASIONAL_WEEKLY,
    name: 'Occasional Caregiver',
    interval: 'week',
    currency: 'usd',
  },
};

// Helpful runtime checks (only warn once)
let warned = false;
export function assertStripeEnv(plan: PlanKey) {
  const price =
    plan === 'primary_weekly' ? PRIMARY_WEEKLY : OCCASIONAL_WEEKLY;

  if (!warned) {
    if (!PRIMARY_WEEKLY) {
      console.warn(
        '[Stripe] VITE_STRIPE_PRICE_PRIMARY_WEEKLY is empty (or legacy key missing). Current value:',
        ENV.VITE_STRIPE_PRICE_PRIMARY_WEEKLY
      );
    }
    if (!OCCASIONAL_WEEKLY) {
      console.warn(
        '[Stripe] VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY is empty (or legacy key missing). Current value:',
        ENV.VITE_STRIPE_PRICE_OCCASIONAL_WEEKLY
      );
    }
    warned = true;
  }

  if (!price) {
    throw new Error(
      `Missing Stripe price id for ${plan}. Set VITE_STRIPE_PRICE_${plan.toUpperCase()} in your environment and rebuild.`
    );
  }
  return price;
}
