// src/pages/ResetPassword.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

// Supabase password reset links include tokens in the hash, e.g.:
// #access_token=...&refresh_token=...&type=recovery
function parseHashTokens() {
  const h = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  const params = new URLSearchParams(h)
  return {
    access_token: params.get('access_token') || '',
    refresh_token: params.get('refresh_token') || '',
    type: params.get('type') || '',
  }
}

export default function ResetPassword() {
  const [{ loading, authed, error }, setState] = useState({
    loading: true,
    authed: false,
    error: null as string | null,
  })

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Establish a session from the recovery link tokens (or code param) if needed
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Already signed in?
        const cur = await supabase.auth.getSession()
        if (cur.data.session) {
          if (mounted) setState({ loading: false, authed: true, error: null })
          return
        }

        // Try setSession from hash tokens
        const { access_token, refresh_token } = parseHashTokens()
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) throw error
          if (mounted) setState({ loading: false, authed: true, error: null })
          return
        }

        // Some links provide ?code= in the URL
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (mounted) setState({ loading: false, authed: true, error: null })
          return
        }

        // Nothing usable found
        if (mounted) setState({ loading: false, authed: false, error: 'Invalid or expired reset link.' })
      } catch (e: any) {
        if (mounted) setState({ loading: false, authed: false, error: e.message || 'Reset link error.' })
      }
    })()
    return () => { mounted = false }
  }, [])

  const canSubmit = useMemo(
    () => password.length >= 6 && password === confirm && !submitting,
    [password, confirm, submitting]
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Back to sign-in after success
      window.location.href = '/'
    } catch (e: any) {
      alert(e.message || 'Failed to reset password.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Preparing reset link…</div>
      </div>
    )
  }

  if (error || !authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white border rounded-xl p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Password Reset</h1>
          <p className="text-slate-600 mb-4">{error || 'Your reset link is invalid or has expired.'}</p>
          <a href="/" className="px-4 py-2 rounded-lg border hover:bg-slate-50 inline-block">Back to Sign In</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 max-w-md w-full space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Set a New Password</h1>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded-lg border"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {confirm && confirm !== password && (
            <p className="text-sm text-red-600 mt-1">Passwords do not match.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Update Password'}
        </button>
        <div className="text-center">
          <a href="/" className="text-sm text-slate-600 hover:text-slate-900">Back to Sign In</a>
        </div>
      </form>
    </div>
  )
}