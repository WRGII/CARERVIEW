import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { LocaleContext } from './LocaleContext'
import type { Locale, SupportedLocale } from './types'
import { LOCALE_STORAGE_KEY } from './localeStorageKey'

const LS_TRANS_VERSION = 'v2'
function lsTransKey(locale: Locale): string {
  return `cv_trans_${locale}_${LS_TRANS_VERSION}`
}

function readLsCache(locale: Locale): Record<string, string> | undefined {
  try {
    const raw = localStorage.getItem(lsTransKey(locale))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Record<string, string>
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed
  } catch {}
  return undefined
}

function writeLsCache(locale: Locale, map: Record<string, string>): void {
  try {
    localStorage.setItem(lsTransKey(locale), JSON.stringify(map))
  } catch {}
}

const DEFAULT_LOCALE: Locale = 'en'
const VALID_LOCALES: readonly Locale[] = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi', 'ja']

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

type TranslationWindow = {
  __CV_TRANSLATIONS__?: Record<string, Record<string, string>>
}

function readBootstrapCache(locale: Locale): Record<string, string> | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const w = window as unknown as TranslationWindow
    const cached = w.__CV_TRANSLATIONS__?.[locale]
    if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
      return cached
    }
  } catch {}
  return readLsCache(locale)
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
    refetch: refetchLocale,
  } = useQuery({
    queryKey: ['ui_translations', locale],
    queryFn: () => fetchTranslations(locale),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    initialData: () => readBootstrapCache(locale),
    initialDataUpdatedAt: () => (readBootstrapCache(locale) ? Date.now() : 0),
  })

  const { data: enMap, error: enError, refetch: refetchEn } = useQuery({
    queryKey: ['ui_translations', 'en'],
    queryFn: () => fetchTranslations('en'),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    initialData: () => readBootstrapCache('en'),
    initialDataUpdatedAt: () => (readBootstrapCache('en') ? Date.now() : 0),
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

  useEffect(() => {
    if (translationsMap && Object.keys(translationsMap).length > 0) {
      writeLsCache(locale, translationsMap)
    }
  }, [translationsMap, locale])

  useEffect(() => {
    if (enMap && Object.keys(enMap).length > 0) {
      writeLsCache('en', enMap)
    }
  }, [enMap])

  const handleRetry = useCallback(() => {
    refetchLocale()
    refetchEn()
  }, [refetchLocale, refetchEn])

  useEffect(() => {
    const onOnline = () => {
      if (translationsError || enError) handleRetry()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [translationsError, enError, handleRetry])

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
          .then(undefined, () => {})
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

  if (hardError && !hasAnyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 mb-1">Unable to connect</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            CarerView could not load. Please check your internet connection and try again.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!hasAnyData) {
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
