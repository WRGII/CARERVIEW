// src/hooks/useCategories.ts (optional polish)
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

interface Category {
  id: string
  name: string
  type: 'ADL' | 'IADL'
  ada_definition: string
  ot_definition: string
  sort_order: number
  created_at: string
}
interface Question {
  id: string
  category_id: string
  question_text: string
  sort_order: number
  created_at: string
}
interface CategoryWithQuestions extends Category {
  questions: Question[]
}

export const useCategories = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['categories', user?.id],
    enabled: !!user?.id,                   // ← don’t run until authenticated
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<CategoryWithQuestions[]> => {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id,name,type,ada_definition,ot_definition,sort_order,created_at')
        .order('sort_order')

      if (categoriesError) {
        throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
      }

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id,category_id,question_text,sort_order,created_at')
        .order('sort_order')

      if (questionsError) {
        throw new Error(`Failed to fetch questions: ${questionsError.message}`)
      }

      return categories.map(category => ({
        ...category,
        questions: questions.filter(q => q.category_id === category.id),
      }))
    },
  })
}
