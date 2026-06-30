import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

type Role = 'admin' | 'caregiver'

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  role: Role
  disabled: boolean
  created_at?: string
  preferred_locale?: string | null
}

type AuthContextValue = {
  loading: boolean
  error: string | null
  user: User | null
  userId: string | null
  email: string | null
  profile: Profile | null
  role: Role
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  error: null,
  user: null,
  userId: null,
  email: null,
  profile: null,
  role: 'caregiver',
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  async function upsertProfile(userId: string, email: string | null): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        const { data: created, error: insErr } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            display_name: '',
            role: 'caregiver' as Role,
            disabled: false,
          }, { onConflict: 'id' })
          .select()
          .single()
        if (insErr) throw insErr
        return created as Profile
      }

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
      return null
    }
  }

  async function load(session: any) {
    try {
      setError(null)

      const nextUser: User | null = session?.user ?? null
      const emailAddr = nextUser?.email ?? null

      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        return
      }

      setUser(nextUser)

      const prof = await upsertProfile(nextUser.id, emailAddr)

      if (!prof) {
        setError('Unable to load your profile. Please refresh the page.')
        return
      }

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
      setError(e.message)
    }
  }

  useEffect(() => {
    let active = true
    setLoading(true)

    const loadingTimeout = setTimeout(() => {
      if (active) {
        setLoading(false)
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setError('Authentication timeout. Please refresh the page and try again.')
      }
    }, 10000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (!session) {
        clearTimeout(loadingTimeout)
        setUser(null)
        setProfile(null)
        setIsAdmin(false)
        setLoading(false)
      }
    })

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

  return (
    <AuthContext.Provider value={{ loading, error, user, userId, email: userEmail, profile, role, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
