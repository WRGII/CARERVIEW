import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CategoryWithQuestions } from '../lib/supabase'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryWithQuestions[]> => {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')

      if (categoriesError) {
        throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
      }

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .order('sort_order')

      if (questionsError) {
        throw new Error(`Failed to fetch questions: ${questionsError.message}`)
      }

      return categories.map(category => ({
        ...category,
        questions: questions.filter(q => q.category_id === category.id)
      }))
    }
  })
}