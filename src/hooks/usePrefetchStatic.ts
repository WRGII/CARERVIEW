// src/hooks/usePrefetchStatic.ts
import * as React from 'react'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Warm up data the Choose Plan page uses (logo + plans).
 * Safe to call multiple times; will just hit cache.
 */
export async function prefetchChoosePlanAssets(qc?: QueryClient): Promise<void> {
  if (!qc) return // guard: avoid runtime errors if called without a client

  await Promise.all([
    // Site logo (public)
    qc.prefetchQuery({
      queryKey: ['site_logo'],
      queryFn: async () => {
        // Note: site_settings remains in app schema as per requirements
        const { data, error } = await supabase
          .schema('app')
          .from('site_settings')
          .select('logo_url')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (error) throw error
        return data?.logo_url ?? null
      },
      staleTime: 5 * 60 * 1000,
    }),

    // Plan list (public schema)
    qc.prefetchQuery({
      queryKey: ['plans'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_plan_by_price')
          .select('plan_id, name, interval, price_cents, stripe_price_id')
          .order('price_cents', { ascending: true })
        if (error) throw error
        return data ?? []
      },
      staleTime: 5 * 60 * 1000,
    }),
  ])
}

/**
 * Hook version used where we already have React context (e.g., App guards).
 */
export function usePrefetchStatic(enabled: boolean): void {
  const qc = useQueryClient()
  React.useEffect(() => {
    if (enabled) {
      prefetchChoosePlanAssets(qc)
    }
  }, [enabled, qc])
}
