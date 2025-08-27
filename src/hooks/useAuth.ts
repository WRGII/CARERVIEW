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
      console.log('useAuth: Starting authentication process')
      setLoading(true)
      setError(null)

      const params = new URLSearchParams(location.search)
      const raw = params.get('token')
      console.log('useAuth: Raw token from URL:', raw ? 'present' : 'missing')
      if (!raw) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        console.log('useAuth: Validating token...')
        const t = await validateToken(raw)
        console.log('useAuth: Token validation result:', t)
        if (!t) {
          setError('Invalid or expired access token')
        } else {
          setToken(t) // { tokenId, role }
          console.log('useAuth: Token set successfully:', t)
        }
      } catch {
        console.error('useAuth: Token validation failed')
        setError('Failed to validate access token')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [location.search])

  return { token, loading, error }
}
