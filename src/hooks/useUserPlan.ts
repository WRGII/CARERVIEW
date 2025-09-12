// src/hooks/useUserPlan.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/**
 * Canonical plan IDs in DB
 */
export type PlanId = 'primary_weekly' | 'occasional_weekly' | 'free'

export type PlanStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired'

export interface UserPlan {
  user_id: string
  plan_id: PlanId | null
  status: PlanStatus | null
  current_period_start: string | null // ISO string
  current_period_end: string | null   // ISO string
  updated_at?: string | null
}

/**
 * Helper: is a plan currently active (status + within period)
 */
export function hasActivePlan(plan?: UserPlan | null): boolean {
  if (!plan) return false
  if (plan.status !== 'active') return false
  if (!plan.current_period_end) return false
  const now = new Date().toISOString()
  return now <= plan.current_period_end
}

/**
 * Optional helper: get allowed observation limit per plan.
 * (Actual enforcement may happen in SQL/RPC; keep this for UI hints.)
 */
export function getPlanLimits(planId: PlanId | null | undefined) {
  switch (planId) {
    case 'primary_weekly':
      return { obs_limit: 7, usage_window: 'week' as const }
    case 'occasional_weekly':
      return { obs_limit: 1, usage_window: 'week' as const }
    case 'free':
      return { obs_limit: 3, usage_window: 'first30d' as const }
    default:
      return { obs_limit: 0, usage_window: 'unknown' as const }
  }
}

/**
 * Read the user's current local subscription row.
 * Table: app.user_subscriptions
 */
export function useUserPlan() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-plan', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<UserPlan | null> => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .schema('app')
        .from('user_subscriptions')
        .select(
          'user_id, plan_id, status, current_period_start, current_period_end, updated_at'
        )
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      // Normalize to ISO strings if they’re timestamps
      const normalize = (v: any) =>
        typeof v === 'string' ? v : v ? new Date(v).toISOString() : null

      return data
        ? {
            user_id: data.user_id,
            plan_id: (data.plan_id ?? null) as PlanId | null,
            status: (data.status ?? null) as PlanStatus | null,
            current_period_start: normalize(data.current_period_start),
            current_period_end: normalize(data.current_period_end),
            updated_at: normalize(data.updated_at),
          }
        : null
    },
    staleTime: 60_000,
    retry: 2,
  })
}
