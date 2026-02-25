// src/hooks/useCategoryQuestions.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useLocale } from "../i18n/LocaleContext";

export type CategoryQuestionRow = {
  category_id: string;
  category_name: string;
  type: "ADL" | "IADL";
  category_order: number;
  question_id: string;
  question_text: string;
  question_order: number;
};

type RawRow = CategoryQuestionRow & {
  category_translations: Record<string, string> | null;
  question_translations: Record<string, string> | null;
};

export function useCategoryQuestions(
  formType: "ADL" | "IADL" | "COMPREHENSIVE"
) {
  const { locale } = useLocale();

  return useQuery({
    queryKey: ["category-questions", formType, locale],
    queryFn: async (): Promise<CategoryQuestionRow[]> => {
      let query = supabase
        .from("v_category_questions")
        .select(
          `
          category_id,
          category_name,
          category_translations,
          type,
          category_order,
          question_id,
          question_text,
          question_translations,
          question_order
        `
        );

      if (formType !== "COMPREHENSIVE") {
        query = query.eq("type", formType);
      }

      const { data, error } = await query
        .order("category_order", { ascending: true })
        .order("question_order", { ascending: true });

      if (error) throw error;

      return ((data as RawRow[]) ?? []).map((row) => ({
        category_id: row.category_id,
        category_name:
          (row.category_translations as any)?.[locale] ?? row.category_name,
        type: row.type,
        category_order: row.category_order,
        question_id: row.question_id,
        question_text:
          (row.question_translations as any)?.[locale] ?? row.question_text,
        question_order: row.question_order,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
