import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export default function CommunityGuard({ children }: Props) {
  const { user, profile, loading } = useAuth()
  const [expired, setExpired] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setExpired(true), 8000)
    return () => clearTimeout(t)
  }, [])

  if (loading && !expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading community…</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.disabled) {
    return <Navigate to="/#get-started" replace />
  }

  return <>{children}</>
}
