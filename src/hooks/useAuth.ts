// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Role = 'admin' | 'caregiver'
export type Profile = {
  id: string
  display_name: string | null
  role: Role
  disabled: boolean
}

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Single loader that we can call on mount and on every auth change
  const load = async (session: any | null) => {
    try {
      setLoading(true)
      setError(null)

      const u = session?.user ?? null
      setUser(u)

      if (!u) {
        setProfile(null)
        return
      }

      // profiles.id == auth.users.id (NOT user_id)
      const { data, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()

      if (pErr) throw pErr
      setProfile(data as Profile)
    } catch (e: any) {
      setError(e?.message || 'Auth error')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    // Initial session load
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      load(data.session)
    })

    // Listen for sign-in / sign-out / token refresh and reload profile
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      load(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return { loading, error, user, profile }
}
