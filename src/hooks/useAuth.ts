import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { validateToken } from '../lib/auth'
import type { AccessToken } from '../lib/supabase'

export const useAuth = () => {
  const [token, setToken] = useState<AccessToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      setError(null)

      const urlParams = new URLSearchParams(location.search)
      const tokenParam = urlParams.get('token')

      if (!tokenParam) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        const validatedToken = await validateToken(tokenParam)
        
        if (!validatedToken) {
          setError('Invalid or expired access token')
        } else {
          setToken(validatedToken)
        }
      } catch {
        setError('Failed to validate access token')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [location.search])

  return { token, loading, error }
}