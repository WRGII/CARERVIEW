// src/pages/LandingPage.tsx
import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

function useCreateAccount() {
  const navigate = useNavigate()

  return async function createAccount({
    name,
    email,
    password,
  }: { name: string; email: string; password: string }) {
    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) throw error

    const user = data.user
    const session = data.session // null if email confirmation is required

    // If session exists (email confirm OFF), we can upsert profile now.
    if (session && user?.id) {
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: name ?? '',
          email,
          role: 'caregiver',
          disabled: false,
        })
      if (upsertErr) throw upsertErr
      // Straight to plan choice
      navigate('/choose-plan', { replace: true })
      return { needsEmailConfirm: false }
    }

    // If email confirmation is ON, user must confirm before we’re authenticated.
    return { needsEmailConfirm: true }
  }
}

function useSignIn() {
  const navigate = useNavigate()

  return async function signIn({
    email,
    password,
  }: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const user = data.user
    // Ensure profile exists (in case sign-up happened with email confirm ON)
    if (user?.id) {
      // Try to read; if missing, create
      const { data: prof, error: selErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (selErr) throw selErr

      if (!prof) {
        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: user.user_metadata?.display_name ?? '',
            email: user.email ?? '',
            role: 'caregiver',
            disabled: false,
          })
        if (upsertErr) throw upsertErr
      }
    }

    // Go to caregiver; your guard will send to /choose-plan if no active plan
    navigate('/caregiver', { replace: true })
  }
}

export default function LandingPage() {
  const { user, loading } = useAuth()
  const createAccount = useCreateAccount()
  const signIn = useSignIn()

  const [mode, setMode] = React.useState<'signup' | 'signin'>('signup')
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  // If already logged in, nudge to caregiver (guard will handle plan gating)
  const navigate = useNavigate()
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/caregiver', { replace: true })
    }
  }, [loading, user, navigate])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)

    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') || '')
    const email = String(f.get('email') || '')
    const password = String(f.get('password') || '')

    try {
      if (mode === 'signup') {
        const res = await createAccount({ name, email, password })
        if (res?.needsEmailConfirm) {
          setNotice('Check your inbox to confirm your email, then sign in to choose a plan.')
        }
      } else {
        await signIn({ email, password })
      }
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-green/10 to-cyan-primary/10 flex items-center">
      <div className="max-w-4xl w-full mx-auto p-6">
        <div className="bg-warm-white border border-slate-gray/20 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-slate-gray">CarerView</h1>
            <div className="inline-flex rounded-lg border border-slate-gray/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`px-4 py-2 text-sm ${mode === 'signup' ? 'bg-cyan-primary text-white' : 'bg-warm-white text-slate-gray'}`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`px-4 py-2 text-sm ${mode === 'signin' ? 'bg-cyan-primary text-white' : 'bg-warm-white text-slate-gray'}`}
              >
                Sign in
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-peach-blush bg-peach-blush/20 p-3 text-sm text-slate-gray">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 rounded-md border border-mint-green bg-mint-green/20 p-3 text-sm text-slate-gray">
              {notice}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-gray mb-1">Your name</label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Alex Smith"
                  className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-gray mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-gray/30 focus:border-cyan-primary focus:outline-none focus:ring-2 focus:ring-cyan-primary bg-warm-white text-slate-gray"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/reset-password" className="text-sm text-slate-gray/70 underline">
                Forgot password?
              </Link>
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl px-4 py-2 bg-cyan-primary text-white hover:opacity-90 disabled:opacity-60"
              >
                {busy ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-xs text-slate-gray/70">
            By continuing, you agree to our Terms & Privacy. (Admin can update these docs in Settings.)
          </div>
        </div>
      </div>
    </div>
  )
}
