import { QueryClient } from '@tanstack/react-query'
import { supabase } from './supabaseClient'

/**
 * Prefetch all data needed for observation forms to improve loading performance.
 * This should be called when the user is on the "Choose observation type" screen
 * so that data is ready when they select a specific form type.
 * All four queries run in parallel via Promise.all for minimal latency.
 */
export async function prefetchObservationFormAssets(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  if (!userId) return

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['legend', userId],
      staleTime: 10 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('legend')
          .select('score, description')
          .order('score', { ascending: true })
        if (error) throw new Error(`Failed to fetch legend: ${error.message}`)
        return data ?? []
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ['category-questions', userId, 'ADL'],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_category_questions')
          .select('category_id, category_name, type, category_order, question_id, question_text, question_order')
          .eq('type', 'ADL')
          .order('category_order', { ascending: true })
          .order('question_order', { ascending: true })
        if (error) throw new Error(error.message)
        return data || []
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ['category-questions', userId, 'IADL'],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_category_questions')
          .select('category_id, category_name, type, category_order, question_id, question_text, question_order')
          .eq('type', 'IADL')
          .order('category_order', { ascending: true })
          .order('question_order', { ascending: true })
        if (error) throw new Error(error.message)
        return data || []
      },
    }),

    queryClient.prefetchQuery({
      queryKey: ['category-questions', userId, 'COMPREHENSIVE'],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_category_questions')
          .select('category_id, category_name, type, category_order, question_id, question_text, question_order')
          .order('category_order', { ascending: true })
          .order('question_order', { ascending: true })
        if (error) throw new Error(error.message)
        return data || []
      },
    }),
  ])
}
