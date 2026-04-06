import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLocale } from '../../i18n/LocaleContext'

interface Props {
  children: React.ReactNode
}

export default function CommunityGuard({ children }: Props) {
  const { user, profile, loading } = useAuth()
  const { t } = useLocale()
  const [expired, setExpired] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setExpired(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  if (loading && !expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">{t('community.loading')}</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.disabled) {
    return <Navigate to="/#get-started" replace />
  }

  return <>{children}</>
}
