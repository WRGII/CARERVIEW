// src/hooks/useCategoryQuestions.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export type CategoryQuestionRow = {
  category_id: string;
  category_name: string;
  type: "ADL" | "IADL";          // canonical name across app
  category_order: number;
  question_id: string;
  question_text: string;
  question_order: number;
};

export function useCategoryQuestions(
  formType: "ADL" | "IADL" | "COMPREHENSIVE"
) {
  return useQuery({
    queryKey: ["category-questions", formType],
    queryFn: async (): Promise<CategoryQuestionRow[]> => {
      let query = supabase
        .from("v_category_questions")
        .select(
          `
          category_id,
          category_name,
          type,
          category_order,
          question_id,
          question_text,
          question_order
        `
        );

      // For ADL/IADL filter by the canonical DB column `type`
      if (formType !== "COMPREHENSIVE") {
        query = query.eq("type", formType);
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
