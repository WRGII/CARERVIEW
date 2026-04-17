import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { LocaleContext } from './LocaleContext'
import type { Locale, SupportedLocale } from './types'
import { LOCALE_STORAGE_KEY } from './localeStorageKey'

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
    .rpc('get_translations_for_locale', { p_locale: locale })
  if (error) throw error
  return (data as Record<string, string>) ?? {}
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

  const [prevMap, setPrevMap] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (!isValidLocale(preferredLocale) || preferredLocale === locale) return
    const next = preferredLocale
    queryClient.prefetchQuery({
      queryKey: ['ui_translations', next],
      queryFn: () => fetchTranslations(next),
      staleTime: 5 * 60 * 1000,
    }).then(() => {
      setLocaleState(next)
    })
  }, [preferredLocale])

  const {
    data: translationsMap,
    isLoading: translationsLoading,
    error: translationsError,
  } = useQuery({
    queryKey: ['ui_translations', locale],
    queryFn: () => fetchTranslations(locale),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  const { data: enMap, error: enError } = useQuery({
    queryKey: ['ui_translations', 'en'],
    queryFn: () => fetchTranslations('en'),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

  useEffect(() => {
    if (translationsError) {
      console.error('[i18n] Failed to fetch translations for locale', locale, translationsError)
    }
  }, [translationsError, locale])

  useEffect(() => {
    if (enError) {
      console.error('[i18n] Failed to fetch English fallback translations', enError)
    }
  }, [enError])

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

  const activeMap = translationsMap ?? prevMap

  useEffect(() => {
    if (translationsMap) {
      setPrevMap(translationsMap)
    }
  }, [translationsMap])

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
          .catch(() => {})
      }
    },
    [userId, queryClient]
  )

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const raw = activeMap?.[key] ?? enMap?.[key] ?? key
      return interpolate(raw, vars)
    },
    [activeMap, enMap]
  )

  const isLoading = translationsLoading && !translationsMap

  const value = useMemo(
    () => ({ locale, setLocale, t, isLoading, supportedLocales }),
    [locale, setLocale, t, isLoading, supportedLocales]
  )

  const hasAnyData = Boolean(activeMap || enMap)
  const hardError = Boolean(translationsError && enError)

  if (!hasAnyData && !hardError) {
    return (
      <LocaleContext.Provider value={value}>
        <div
          role="status"
          aria-live="polite"
          className="min-h-screen flex items-center justify-center bg-white"
        >
          <div className="flex gap-1.5" aria-label="Loading">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
          </div>
        </div>
      </LocaleContext.Provider>
    )
  }

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
