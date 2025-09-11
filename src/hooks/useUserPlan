// src/hooks/useUserPlan.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export type PlanId = 'primary_weekly' | 'occasional_monthly' | 'free'
export type PlanStatus = 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | null

export interface UserPlan {
  plan_id: PlanId | null
  status: PlanStatus
  current_period_end: string | null
}

/**
 * Reads the most-recent subscription row for the current user from app.user_subscriptions.
 * Enabled only when VITE_REQUIRE_SUBSCRIPTION=true and a user is present.
 */
export function useUserPlan() {
  const { user } = useAuth()
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true'

  return useQuery<UserPlan | null>({
    queryKey: ['user-plan', user?.id],
    enabled: requireSub && !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('app')
        .from('user_subscriptions')
        .select('plan_id,status,current_period_end')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // PGRST116 = "Results contain 0 rows"; treat as null (no plan yet)
      if (error && (error as any).code !== 'PGRST116') throw error
      if (!data) return null

      return {
        plan_id: (data as any).plan_id ?? null,
        status: (data as any).status ?? null,
        current_period_end: (data as any).current_period_end ?? null,
      }
    },
  })
}

export const hasActivePlan = (p: UserPlan | null | undefined) =>
  !!p?.plan_id && p?.status === 'active'
