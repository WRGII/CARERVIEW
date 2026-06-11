// src/main.tsx
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { queryClient } from './lib/queryClient'
import { supabase } from './lib/supabaseClient'

const LOCALE_STORAGE_KEY = 'careview-locale'
const VALID_LOCALES = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi', 'ja'] as const
type Locale = typeof VALID_LOCALES[number]

function getBootstrapLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && VALID_LOCALES.includes(stored as Locale)) return stored as Locale
  } catch {}
  return 'en'
}

async function fetchTranslations(locale: Locale): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .rpc('get_translations_for_locale', { p_locale: locale })
  if (error) throw error
  return (data as Record<string, string>) ?? {}
}

const bootstrapLocale = getBootstrapLocale()

function mount() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

function timeoutAfter<T>(ms: number): Promise<T> {
  return new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('bootstrap-timeout')), ms)
  )
}

type TranslationWindow = {
  __CV_TRANSLATIONS__?: Record<string, Record<string, string>>
}

const LS_TRANS_VERSION = 'v2'
function lsTransKey(locale: Locale): string {
  return `cv_trans_${locale}_${LS_TRANS_VERSION}`
}

function writeCache(locale: Locale, map: Record<string, string>): void {
  queryClient.setQueryData(['ui_translations', locale], map)
  try {
    const w = window as unknown as TranslationWindow
    w.__CV_TRANSLATIONS__ = {
      ...(w.__CV_TRANSLATIONS__ ?? {}),
      [locale]: map,
    }
  } catch {}
  try {
    localStorage.setItem(lsTransKey(locale), JSON.stringify(map))
  } catch {}
}

async function bootstrapOne(locale: Locale): Promise<void> {
  try {
    const data = await Promise.race([
      fetchTranslations(locale),
      timeoutAfter<Record<string, string>>(3000),
    ])
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      writeCache(locale, data)
    } else {
      console.error('[bootstrap] empty translations for locale', locale)
    }
  } catch (err) {
    console.error('[bootstrap] translations failed for locale', locale, err)
  }
}

async function bootstrap(): Promise<void> {
  const tasks: Array<Promise<void>> = [bootstrapOne(bootstrapLocale)]
  if (bootstrapLocale !== 'en') {
    tasks.push(bootstrapOne('en'))
  }
  await Promise.all(tasks)
}

bootstrap().finally(mount)
