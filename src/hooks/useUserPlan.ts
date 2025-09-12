// src/hooks/useUserPlan.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/** Canonical plan IDs in DB */
export type PlanId = 'primary_weekly' | 'occasional_weekly' | 'free'

/** Mirror of what our webhooks may write */
export type PlanStatus =
  | 'active'
  | 'trialing'
  | 'canceled'
  | 'past_due'
  | 'incomplete'
  | 'incomplete_expired'

export interface UserPlan {
  user_id: string
  plan_id: PlanId | null
  status: PlanStatus | null
  current_period_start: string | null // ISO
  current_period_end: string | null   // ISO
  updated_at?: string | null
}

/** Is the plan currently usable? (status + within period) */
export function hasActivePlan(plan?: UserPlan | null): boolean {
  if (!plan) return false
  if (!(plan.status === 'active' || plan.status === 'trialing')) return false
  if (!plan.current_period_end) return false
  const endMs = new Date(plan.current_period_end).getTime()
  return Number.isFinite(endMs) && Date.now() <= endMs
}

/** Optional helper for UI hints only */
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

/** Read the user's current local subscription row (app.user_subscriptions) */
export function useUserPlan() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['app.user_subscriptions', 'user-plan', user?.id],
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

      const normalize = (v: unknown): string | null =>
        typeof v === 'string' ? v : v ? new Date(v as any).toISOString() : null

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
