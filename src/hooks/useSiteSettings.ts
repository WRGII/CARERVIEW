// src/hooks/useSiteSettings.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

type SiteSettings = {
  logo_url: string
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    staleTime: 60 * 60 * 1000, // 1 hour
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw new Error(error.message)
      return data ?? null
    }
  })
}
