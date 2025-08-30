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

  // Make admin comparison case-insensitive to avoid false negatives
  const ADMIN_EMAIL = 'william.griffith@grifii.com'.toLowerCase()

  async function upsertProfile(userId: string, email: string | null) {
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
  }

  async function load(session: any) {
    try {
      // IMPORTANT: do NOT setLoading(true) here; we control loading around the subscription
      setError(null)

      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setIsAdmin(false)
        return
      }

      const userId: string = nextUser.id
      const emailAddr: string | null = nextUser.email ?? null

      const prof = await upsertProfile(userId, emailAddr)
      setProfile(prof)

      // Email-based guard avoids race with DB trigger updating role.
      // Compare in lower-case to prevent casing issues.
      setIsAdmin((emailAddr ?? '').toLowerCase() === ADMIN_EMAIL)
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? 'Failed to load auth/profile')
      setProfile(null)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    let active = true
    // Keep loading true until INITIAL_SESSION (or first auth event) is processed
    setLoading(true)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return
      await load(session)
      // first event (including INITIAL_SESSION) will flip loading off
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const role: Role = isAdmin ? 'admin' : (profile?.role ?? 'caregiver')
  const userEmail: string | null = profile?.email ?? user?.email ?? null
  const userId: string | null = user?.id ?? null

  return { loading, error, user, userId, email: userEmail, profile, role, isAdmin }
}
