// src/hooks/useLegend.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

type LegendRow = { score: number; description: string };

export function useLegend() {
  return useQuery({
    queryKey: ["legend"], // stable, no auth coupling
    queryFn: async (): Promise<LegendRow[]> => {
      const { data, error } = await supabase
        .from("legend")
        .select("score, description")
        .order("score", { ascending: true });

      if (error) throw error;
      return (data as LegendRow[]) ?? [];
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
