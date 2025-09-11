// src/hooks/usePrefetchStatic.ts
import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * Prefetches static data used throughout the app right after login.
 * Safe to call multiple times – react-query will dedupe.
 */
export function usePrefetchStatic(enabled: boolean) {
  const qc = useQueryClient()

  React.useEffect(() => {
    if (!enabled) return

    // v_category_questions
    qc.prefetchQuery({
      queryKey: ['category-questions', 'static'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('v_category_questions')
          .select('category_id,category_name,type,category_order,question_id,question_text,question_order')
          .order('category_order', { ascending: true })
          .order('question_order', { ascending: true })
        if (error) throw new Error(error.message)
        return data ?? []
      },
      staleTime: 5 * 60 * 1000,
    })

    // categories
    qc.prefetchQuery({
      queryKey: ['categories', 'static'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('id,name,type,sort_order')
          .order('sort_order', { ascending: true })
        if (error) throw new Error(error.message)
        return data ?? []
      },
      staleTime: 5 * 60 * 1000,
    })

    // legend (1–5)
    qc.prefetchQuery({
      queryKey: ['legend', 'static'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('legend')
          .select('score,description')
          .order('score', { ascending: true })
        if (error) throw new Error(error.message)
        return data ?? []
      },
      staleTime: 5 * 60 * 1000,
    })
  }, [enabled, qc])
}
