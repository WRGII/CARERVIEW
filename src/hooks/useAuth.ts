// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Role = 'admin' | 'caregiver'

export type Profile = {
  id: string              // mirrors auth.users.id
  email: string | null
  display_name: string | null
  role: Role
  disabled: boolean
  created_at?: string
}

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)           // Supabase session.user
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  async function upsertProfile(userId: string, email: string | null): Promise<Profile | null> {
    try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId) // profiles.id == auth.users.id in your schema
      .maybeSingle()

    if (error) throw error

    if (!data) {
      const insert = {
        id: userId,
        email,
        display_name: '',
        role: 'caregiver' as Role,
        disabled: false,
      }
      const { data: created, error: insErr } = await supabase
        .from('profiles')
        .insert(insert)
        .select()
        .single()
      if (insErr) throw insErr
      return created as Profile
    }

    // keep email in sync
    if (email && data.email !== email) {
      const { data: updated, error: updErr } = await supabase
        .from('profiles')
        .update({ email })
        .eq('id', userId)
        .select()
        .single()
      if (updErr) throw updErr
      return updated as Profile
    }

    return data as Profile
    } catch (e: any) {
      console.error('[useAuth] upsertProfile unexpected error:', e)
      return null
    }
  }

  async function load(session: any) {
    try {
      // IMPORTANT: do NOT setLoading(true) here; we control loading around the subscription
      setError(null)

      const nextUser = session?.user ?? null
      const emailAddr = nextUser?.email ?? null
      
      // If no user, clear everything and return
      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        return
      }
      
      setUser(nextUser)
      
      // Try to load/create profile
      const prof = await upsertProfile(nextUser.id, emailAddr)
      
      // If profile couldn't be loaded or created, treat as unauthenticated
      if (!prof) {
        // Force sign out to clear any stale session data
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setError('Unable to access your profile. Please sign in again.')
        return
      }

      // If profile is disabled, sign out immediately
      if (prof.disabled) {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setError('Account disabled. Please contact support.')
        return
      }
      
      setProfile(prof)
      setIsAdmin(prof.role === 'admin')
    } catch (e: any) {
      console.error(e)
      // Force sign out on any error to clear stale session
      await supabase.auth.signOut()
      setError(e.message)
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    let active = true
    // Keep loading true until INITIAL_SESSION (or first auth event) is processed
    setLoading(true)

    // Add a timeout to prevent infinite loading states
    const loadingTimeout = setTimeout(() => {
      if (active) {
        console.warn('[useAuth] Loading timeout reached, forcing unauthenticated state')
        setLoading(false)
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setError('Authentication timeout. Please refresh the page and try again.')
      }
    }, 10000) // 10 second timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return

      clearTimeout(loadingTimeout)

      ;(async () => {
        await load(session)
        setLoading(false)
      })()
    })

    return () => {
      active = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const role: Role = profile?.role ?? 'caregiver'
  const userEmail: string | null = profile?.email ?? user?.email ?? null
  const userId: string | null = user?.id ?? null

  return { loading, error, user, userId, email: userEmail, profile, role, isAdmin }
}
