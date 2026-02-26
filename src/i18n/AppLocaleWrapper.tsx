import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import LocaleProvider from './LocaleProvider'

const LOCALE_STORAGE_KEY = 'careview-locale'
const VALID_LOCALES = ['en', 'es', 'it', 'fr', 'de', 'sv', 'fi'] as const
type Locale = typeof VALID_LOCALES[number]

function getStoredLocale(): string | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && VALID_LOCALES.includes(stored as Locale)) return stored
  } catch {}
  return null
}

interface Props {
  children: React.ReactNode
}

export default function AppLocaleWrapper({ children }: Props) {
  const { user, profile } = useAuth()

  const [reconciledLocale, setReconciledLocale] = useState<string | null>(
    () => getStoredLocale()
  )
  const [reconciledUserId, setReconciledUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const profileLocale = (profile as any)?.preferred_locale ?? null
    if (profileLocale && profileLocale !== reconciledLocale) {
      setReconciledLocale(profileLocale)
    }
  }, [profile?.id ?? null])

  useEffect(() => {
    const nextId = user?.id ?? undefined
    if (nextId !== reconciledUserId) {
      setReconciledUserId(nextId)
    }
  }, [user?.id ?? null])

  return (
    <LocaleProvider userId={reconciledUserId} preferredLocale={reconciledLocale}>
      {children}
    </LocaleProvider>
  )
}
