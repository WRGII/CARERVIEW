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

export type PlanSource = 'own' | 'team'
export type TeamRole = 'owner' | 'member' | null

export interface UserPlan {
  user_id: string
  plan_id: PlanId | null
  status: PlanStatus | null
  current_period_start: string | null // ISO
  current_period_end: string | null   // ISO
  updated_at?: string | null
  price_id?: string | null
  source: PlanSource
  team_role: TeamRole
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

export interface PlanLimits {
  obs_limit: number
  usage_window: string
}

/** Fetch plan limits from DB. Falls back to zero on error. */
export async function getPlanLimits(planId: PlanId | null | undefined): Promise<PlanLimits> {
  if (!planId) return { obs_limit: 0, usage_window: 'unknown' }
  const { data } = await supabase
    .from('subscription_plans')
    .select('obs_limit, usage_window')
    .eq('id', planId)
    .maybeSingle()
  return {
    obs_limit: data?.obs_limit ?? 0,
    usage_window: data?.usage_window ?? 'unknown',
  }
}

/** Synchronous fallback limits for places that can't await. */
export function getPlanLimitsSync(planId: PlanId | null | undefined): PlanLimits {
  switch (planId) {
    case 'primary_qtr': return { obs_limit: 100, usage_window: 'year' }
    case 'family_qtr':  return { obs_limit: 200, usage_window: 'year' }
    case 'free':        return { obs_limit: 3,   usage_window: 'year' }
    default:            return { obs_limit: 0,   usage_window: 'unknown' }
  }
}

/** Fallback: read plan directly from user_subscriptions + team membership */
async function fetchPlanDirect(userId: string): Promise<UserPlan | null> {
  // Own subscription
  const { data: own } = await supabase
    .from('user_subscriptions')
    .select('plan_id, status, current_period_start, current_period_end, updated_at')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (own && own.plan_id !== 'free') {
    return {
      user_id: userId,
      plan_id: own.plan_id as PlanId,
      status: own.status as PlanStatus,
      current_period_start: own.current_period_start ?? null,
      current_period_end: own.current_period_end ?? null,
      updated_at: own.updated_at ?? null,
      source: 'own',
      team_role: null,
    }
  }

  // Team membership check
  const { data: membership } = await supabase
    .from('cv_team_members')
    .select('team_id, cv_teams!inner(owner_id)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (membership) {
    const ownerId = (membership as any).cv_teams?.owner_id
    if (ownerId) {
      const { data: ownerSub } = await supabase
        .from('user_subscriptions')
        .select('plan_id, status, current_period_start, current_period_end, updated_at')
        .eq('user_id', ownerId)
        .in('status', ['active', 'trialing'])
        .eq('plan_id', 'family_qtr')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (ownerSub) {
        return {
          user_id: userId,
          plan_id: ownerSub.plan_id as PlanId,
          status: ownerSub.status as PlanStatus,
          current_period_start: ownerSub.current_period_start ?? null,
          current_period_end: ownerSub.current_period_end ?? null,
          updated_at: ownerSub.updated_at ?? null,
          source: 'team',
          team_role: 'member',
        }
      }
    }
  }

  // Return own free plan if exists
  if (own) {
    return {
      user_id: userId,
      plan_id: own.plan_id as PlanId,
      status: own.status as PlanStatus,
      current_period_start: own.current_period_start ?? null,
      current_period_end: own.current_period_end ?? null,
      updated_at: own.updated_at ?? null,
      source: 'own',
      team_role: null,
    }
  }

  return null
}

/** Read the user's effective plan via cv_get_effective_plan RPC, with fallback */
export function useUserPlan() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['effective-plan', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<UserPlan | null> => {
      if (!user?.id) return null

      try {
        const { data, error } = await supabase
          .rpc('cv_get_effective_plan', { p_user_id: user.id })
          .maybeSingle() as { data: Record<string, any> | null; error: any }

        if (error) throw error
        if (!data) return fetchPlanDirect(user.id)

        return {
          user_id: user.id,
          plan_id: (data.plan_id ?? null) as PlanId | null,
          status: (data.status ?? null) as PlanStatus | null,
          current_period_start: data.current_period_start ?? null,
          current_period_end: data.current_period_end ?? null,
          source: (data.source as PlanSource) ?? 'own',
          team_role: (data.team_role as TeamRole) ?? null,
        }
      } catch {
        return fetchPlanDirect(user.id)
      }
    },
    staleTime: 60_000,
    retry: 2,
  })
}
