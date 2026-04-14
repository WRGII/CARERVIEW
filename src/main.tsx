// src/main.tsx
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { queryClient } from './lib/queryClient'
import { supabase } from './lib/supabaseClient'

const LOCALE_STORAGE_KEY = 'careview-locale'
const VALID_LOCALES = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi'] as const
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
    .from('ui_translations')
    .select('key, value')
    .eq('locale', locale)
    .limit(5000)
  if (error) throw error
  const map: Record<string, string> = {}
  for (const row of data ?? []) {
    map[row.key] = row.value
  }
  return map
}

const bootstrapLocale = getBootstrapLocale()
queryClient.prefetchQuery({
  queryKey: ['ui_translations', bootstrapLocale],
  queryFn: () => fetchTranslations(bootstrapLocale),
  staleTime: 10 * 60 * 1000,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
