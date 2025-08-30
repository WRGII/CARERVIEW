// src/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Role = 'admin' | 'caregiver'

export type Profile = {
  id: string              // mirrors auth.users.id
  email: string | null    // stored for easy checks
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
  const ADMIN_EMAIL = 'william.griffith@grifii.com'

  async function upsertProfile(userId: string, email: string | null) {
    // Try to fetch profile by id (your profiles.id = auth.users.id)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      // Insert default caregiver profile (DB trigger enforces admin for ADMIN_EMAIL)
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

    // Keep email in sync if it changed
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
      setLoading(true)
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

      // Frontend guard: compute admin by email (DB trigger already enforces role)
      const admin = emailAddr === ADMIN_EMAIL
      setIsAdmin(admin)
    } catch (e: any) {
      console.error(e)
      setError(e.message ?? 'Failed to load auth/profile')
      setProfile(null)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      load(data.session)
    })

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

  const role: Role = isAdmin ? 'admin' : (profile?.role ?? 'caregiver')
  const userEmail: string | null = profile?.email ?? user?.email ?? null
  const userId: string | null = user?.id ?? null

  return { loading, error, user, userId, email: userEmail, profile, role, isAdmin }
}
