import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Profile = { id: string; display_name: string; role: 'admin'|'caregiver'; disabled: boolean }

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { session }, error: sErr } = await supabase.auth.getSession()
        if (sErr) throw sErr
        const u = session?.user ?? null
        if (!u) {
          if (mounted) { setUser(null); setProfile(null) }
          return
        }
        if (mounted) setUser(u)
        // fetch profile
        const { data: rows, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .limit(1)
        if (pErr) throw pErr
        const p = rows?.[0] ?? null
        if (mounted) setProfile(p)
      } catch (e: any) {
        if (mounted) setError(e.message || 'Auth error')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) setProfile(null)
    })
    return () => { mounted = false; sub.data.subscription.unsubscribe() }
  }, [])

  return { loading, error, user, profile }
}
