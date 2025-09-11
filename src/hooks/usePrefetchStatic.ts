// src/hooks/usePrefetchStatic.ts
import * as React from "react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

/** ---- ChoosePlan data fetchers ---- */
async function fetchPlans() {
  const { data, error } = await supabase
    .schema("app")
    .from("subscription_plans")
    .select("id,name,obs_limit,usage_window")
    .order("id");
  if (error) throw error;
  return data ?? [];
}

async function fetchLogo() {
  const { data, error } = await supabase
    .schema("app")
    .from("site_settings")
    .select("logo_url")
    .order("updated_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0]?.logo_url ?? null;
}

/**
 * Call this to warm the ChoosePlan route and its data before navigating.
 * - Prefetches subscription plans
 * - Prefetches the site logo
 * - Preloads the ChoosePlan route chunk
 */
export async function prefetchChoosePlanAssets(qc: QueryClient) {
  await Promise.all([
    qc.prefetchQuery({
      queryKey: ["subscription-plans"],
      queryFn: fetchPlans,
      staleTime: 60 * 60 * 1000, // 1h
    }),
    qc.prefetchQuery({
      queryKey: ["site-settings", "logo"],
      queryFn: fetchLogo,
      staleTime: 60 * 60 * 1000, // 1h
    }),
    import("../pages/ChoosePlan"),
  ]);
}

/**
 * You already call this from CaregiverGuard. Keeping it here so
 * existing imports don’t break. Add additional static prefetches here later.
 */
export function usePrefetchStatic(enabled: boolean) {
  const qc = useQueryClient();
  React.useEffect(() => {
    if (!enabled) return;
    // (Intentionally blank for now; you can add more static warms later.)
  }, [enabled, qc]);
}
