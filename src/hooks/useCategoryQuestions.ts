import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export type FormType = 'ADL' | 'IADL' | 'COMPREHENSIVE'

export interface CategoryQuestionRow {
  category_id: string
  category_name: string
  category_type: 'ADL' | 'IADL'
  category_order: number
  question_id: string
  question_text: string
  question_order: number
}

async function fetchCategoryQuestions(formType: FormType) {
  const { data, error } = await supabase.rpc('get_category_questions', {
    p_form_type: formType,
  })
  if (error) throw error
  return data as CategoryQuestionRow[]
}

export function useCategoryQuestions(formType?: FormType) {
  return useQuery({
    queryKey: ['category-questions', formType],
    enabled: !!formType,
    queryFn: () => fetchCategoryQuestions(formType!),
    staleTime: 10 * 60 * 1000,
  })
}
