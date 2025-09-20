// src/hooks/usePlans.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { PlanRow } from '../types/plans'

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async (): Promise<PlanRow[]> => {
      const { data, error } = await supabase
        .from('v_plan_by_price')
        .select('plan_id, name, interval, price_cents, stripe_price_id')
        .order('price_cents', { ascending: true })

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}