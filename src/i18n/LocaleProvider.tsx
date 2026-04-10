import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { LocaleContext } from './LocaleContext'
import type { Locale, SupportedLocale } from './types'
import enFallback from './enFallback'

const LOCALE_STORAGE_KEY = 'careview-locale'
const DEFAULT_LOCALE: Locale = 'en'
const VALID_LOCALES: readonly Locale[] = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi']

function isValidLocale(v: string | null | undefined): v is Locale {
  return VALID_LOCALES.includes(v as Locale)
}

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isValidLocale(stored)) return stored
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

async function fetchTranslations(locale: Locale): Promise<Record<string, string>> {
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
}

interface Props {
  children: React.ReactNode
  userId?: string
  preferredLocale?: string | null
}

export default function LocaleProvider({ children, userId, preferredLocale }: Props) {
  const queryClient = useQueryClient()

  const [locale, setLocaleState] = useState<Locale>(() => {
    if (isValidLocale(preferredLocale)) return preferredLocale
    return getStoredLocale()
  })

  const prevMapRef = useRef<Record<string, string> | null>(null)
  const enMapRef = useRef<Record<string, string> | null>(enFallback)

  useEffect(() => {
    if (isValidLocale(preferredLocale) && preferredLocale !== locale) {
      setLocaleState(preferredLocale)
    }
  }, [preferredLocale])

  const { data: translationsMap, isLoading: translationsLoading } = useQuery({
    queryKey: ['ui_translations', locale],
    queryFn: () => fetchTranslations(locale),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  const { data: enMap } = useQuery({
    queryKey: ['ui_translations', 'en'],
    queryFn: () => fetchTranslations('en'),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: locale !== 'en',
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
    gcTime: 60 * 60 * 1000,
  })

  useEffect(() => {
    if (translationsMap) {
      prevMapRef.current = translationsMap
    }
  }, [translationsMap])

  useEffect(() => {
    if (enMap) {
      enMapRef.current = enMap
    }
  }, [enMap])

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      setLocaleState(newLocale)
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
      } catch {}

      if (userId) {
        supabase
          .from('profiles')
          .update({ preferred_locale: newLocale })
          .eq('id', userId)
          .then(({ error }) => {
            if (!error) {
              queryClient.invalidateQueries({ queryKey: ['profile', userId] })
            }
          })
      }
    },
    [userId, queryClient]
  )

  const activeMap = translationsMap ?? prevMapRef.current

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = activeMap?.[key] ?? enMapRef.current?.[key] ?? enFallback[key] ?? key
      return interpolate(raw, vars)
    },
    [activeMap]
  )

  const isLoading = translationsLoading && prevMapRef.current === null

  const value = useMemo(
    () => ({ locale, setLocale, t, isLoading, supportedLocales }),
    [locale, setLocale, t, isLoading, supportedLocales]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
