import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { LocaleContext } from './LocaleContext'
import type { Locale, SupportedLocale } from './types'

const LOCALE_STORAGE_KEY = 'careview-locale'
const DEFAULT_LOCALE: Locale = 'en'

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {}
  return DEFAULT_LOCALE
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return Object.entries(vars).reduce(
    (str, [key, val]) => str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val)),
    template
  )
}

interface Props {
  children: React.ReactNode
  userId?: string
  preferredLocale?: string | null
}

export default function LocaleProvider({ children, userId, preferredLocale }: Props) {
  const queryClient = useQueryClient()

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (preferredLocale === 'en' || preferredLocale === 'es') return preferredLocale
    return getStoredLocale()
  })

  useEffect(() => {
    if (preferredLocale === 'en' || preferredLocale === 'es') {
      setLocaleState(preferredLocale)
    }
  }, [preferredLocale])

  const { data: translationsMap, isLoading: translationsLoading } = useQuery({
    queryKey: ['ui_translations', locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_translations')
        .select('key, value')
        .eq('locale', locale)
      if (error) throw error
      const map: Record<string, string> = {}
      for (const row of data ?? []) {
        map[row.key] = row.value
      }
      return map
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const { data: supportedLocales = [] } = useQuery<SupportedLocale[]>({
    queryKey: ['supported_locales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supported_locales')
        .select('code, label, is_default, sort_order')
        .eq('is_active', true)
        .order('sort_order')
      if (error) throw error
      return (data ?? []) as SupportedLocale[]
    },
    staleTime: 60 * 60 * 1000,
  })

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      setLocaleState(newLocale)
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
      } catch {}

      if (userId) {
        await supabase
          .from('profiles')
          .update({ preferred_locale: newLocale })
          .eq('id', userId)

        queryClient.invalidateQueries({ queryKey: ['profile', userId] })
      }
    },
    [userId, queryClient]
  )

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = translationsMap?.[key] ?? key
      return interpolate(raw, vars)
    },
    [translationsMap]
  )

  const value = useMemo(
    () => ({ locale, setLocale, t, isLoading: translationsLoading, supportedLocales }),
    [locale, setLocale, t, translationsLoading, supportedLocales]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
