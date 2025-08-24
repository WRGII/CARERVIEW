// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { validateToken, type SessionToken } from '../lib/auth'

export const useAuth = () => {
  const [token, setToken] = useState<SessionToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams(location.search)
      const raw = params.get('token')
      if (!raw) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        const t = await validateToken(raw)
        if (!t) {
          setError('Invalid or expired access token')
        } else {
          setToken(t) // { tokenId, role }
        }
      } catch {
        setError('Failed to validate access token')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [location.search])

  return { token, loading, error }
}
