// src/hooks/useUserPlan.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

/** Canonical plan IDs in DB */
export type PlanId = 'free' | 'primary_qtr' | 'family_qtr'

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
  price_id?: string | null
}

/** Is the plan currently usable? Require status + within time window. */
export function hasActivePlan(plan?: UserPlan | null): boolean {
  if (!plan) return false
  const okStatus = plan.status === 'active' || plan.status === 'trialing'
  if (!okStatus) return false
  if (!plan.current_period_start || !plan.current_period_end) return false

  const now = Date.now()
  const start = Date.parse(plan.current_period_start)
  const end = Date.parse(plan.current_period_end)
  if (Number.isNaN(start) || Number.isNaN(end)) return false

  return start <= now && now < end
}

/** Optional helper for UI hints only */
export function getPlanLimits(planId: PlanId | null | undefined) {
  switch (planId) {
    case 'primary_qtr':
      return { obs_limit: 30, usage_window: 'year' as const }
    case 'family_qtr':
      return { obs_limit: 100, usage_window: 'year' as const }
    case 'free':
      return { obs_limit: 3, usage_window: 'year' as const }
    default:
      return { obs_limit: 0, usage_window: 'unknown' as const }
  }
}

/** Read the user's current subscription row (public.user_subscriptions) */
export function useUserPlan() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['public.user_subscriptions', 'user-plan', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<UserPlan | null> => {
      if (!user?.id) return null

      // Pick the most relevant, currently-active-ish row
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(
          'user_id, plan_id, status, current_period_start, current_period_end, updated_at, price_id'
        )
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('current_period_end', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      const normalizeIso = (v: unknown): string | null =>
        typeof v === 'string'
          ? v
          : v
          ? new Date(v as any).toISOString()
          : null

      return data
        ? {
            user_id: data.user_id,
            plan_id: (data.plan_id ?? null) as PlanId | null,
            status: (data.status ?? null) as PlanStatus | null,
            current_period_start: normalizeIso(data.current_period_start),
            current_period_end: normalizeIso(data.current_period_end),
            updated_at: normalizeIso(data.updated_at),
            price_id: (data as any).price_id ?? null,
          }
        : null
    },
    staleTime: 60_000,
    retry: 2,
  })
}
