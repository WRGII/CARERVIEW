// src/hooks/useCategoryQuestions.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export type CategoryQuestionRow = {
  category_id: string;
  category_name: string;
  category_type: "ADL" | "IADL";
  category_order: number;
  question_id: string;
  question_text: string;
  question_order: number;
};

/**
 * Single stable query path; key depends only on formType.
 * No conditional hooks, no auth coupling. RLS protects row access.
 */
export function useCategoryQuestions(
  formType: "ADL" | "IADL" | "COMPREHENSIVE"
) {
  return useQuery({
    queryKey: ["category-questions", formType],
    queryFn: async (): Promise<CategoryQuestionRow[]> => {
      // v_category_questions should expose these exact columns
      let query = supabase
        .from("v_category_questions")
        .select(
          `
          category_id,
          category_name,
          category_type,
          category_order,
          question_id,
          question_text,
          question_order
        `
        );

      if (formType !== "COMPREHENSIVE") {
        query = query.eq("category_type", formType);
      }

      const { data, error } = await query
        .order("category_order", { ascending: true })
        .order("question_order", { ascending: true });

      if (error) throw error;
      return (data as CategoryQuestionRow[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
