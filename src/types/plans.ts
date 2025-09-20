// src/types/plans.ts
export type PlanRow = {
  plan_id: 'free' | 'primary_weekly' | 'occasional_weekly' | string;
  name: string;
  interval: 'week' | 'month' | 'none';
  price_cents: number;
  stripe_price_id: string | null;
};