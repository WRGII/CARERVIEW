// src/hooks/useLegend.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";

type LegendRow = { score: number; description: string };

type RawLegendRow = LegendRow & {
  translations: Record<string, string> | null;
};

export function useLegend() {
  const { locale } = useLocale();

  return useQuery({
    queryKey: ["legend", locale],
    queryFn: async (): Promise<LegendRow[]> => {
      const { data, error } = await supabase
        .from("legend")
        .select("score, description, translations")
        .order("score", { ascending: true });

      if (error) throw error;

      return ((data as RawLegendRow[]) ?? []).map((row) => ({
        score: row.score,
        description:
          (row.translations as any)?.[locale] ?? row.description,
      }));
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
