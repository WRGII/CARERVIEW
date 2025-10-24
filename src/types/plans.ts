// src/types/plans.ts
export type PlanRow = {
  plan_id: 'free' | 'primary_qtr' | 'family_qtr' | string;
  name: string;
  interval: 'quarter' | 'none';
  price_cents: number;
  stripe_price_id: string | null;
};