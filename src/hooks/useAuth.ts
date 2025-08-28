import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { AuthUser } from '../lib/auth'

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (profileError) {
            console.warn('Failed to fetch profile:', profileError)
            setUser(session.user as AuthUser)
          } else {
            setUser({ ...session.user, profile } as AuthUser)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        setError('Failed to get session')
        console.error('Auth error:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (profileError) {
            console.warn('Failed to fetch profile:', profileError)
            setUser(session.user as AuthUser)
          } else {
            setUser({ ...session.user, profile } as AuthUser)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, error }
}