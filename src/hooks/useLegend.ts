// src/hooks/useLegend.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export type LegendRow = {
  score: number;
  description: string;
};

export function useLegend() {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['legend', user?.id],                 // cache per-user session
    enabled: !authLoading && !!user?.id,            // ✅ login-first gate
    staleTime: 10 * 60 * 1000,                      // 10 minutes
    queryFn: async (): Promise<LegendRow[]> => {
      const { data, error } = await supabase
        .from('legend')
        .select('score, description')                // only what we need
        .order('score', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch legend: ${error.message}`);
      }
      return (data ?? []) as LegendRow[];
    },
  });
}
