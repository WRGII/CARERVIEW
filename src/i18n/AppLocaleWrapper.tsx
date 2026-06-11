import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import LocaleProvider from './LocaleProvider'
import { LOCALE_STORAGE_KEY } from './localeStorageKey'
import type { Locale } from './types'

const VALID_LOCALES: readonly Locale[] = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi', 'ja']

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && VALID_LOCALES.includes(stored as Locale)) return stored as Locale
  } catch {}
  return 'en'
}

interface Props {
  children: React.ReactNode
}

export default function AppLocaleWrapper({ children }: Props) {
  const { user, profile } = useAuth()

  const [reconciledLocale, setReconciledLocale] = useState<Locale>(
    () => getStoredLocale()
  )
  const [reconciledUserId, setReconciledUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const profileLocale = profile?.preferred_locale ?? null
    if (profileLocale && VALID_LOCALES.includes(profileLocale as Locale) && profileLocale !== reconciledLocale) {
      setReconciledLocale(profileLocale as Locale)
    }
  }, [profile?.id, profile?.preferred_locale])

  useEffect(() => {
    const nextId = user?.id ?? undefined
    if (nextId !== reconciledUserId) {
      setReconciledUserId(nextId)
    }
  }, [user?.id, reconciledUserId])

  return (
    <LocaleProvider userId={reconciledUserId} preferredLocale={reconciledLocale}>
      {children}
    </LocaleProvider>
  )
}
