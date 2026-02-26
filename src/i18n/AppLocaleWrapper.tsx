import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import LocaleProvider from './LocaleProvider'

interface Props {
  children: React.ReactNode
}

export default function AppLocaleWrapper({ children }: Props) {
  const { user, profile } = useAuth()

  const [reconciledLocale, setReconciledLocale] = useState<string | null>(null)
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
