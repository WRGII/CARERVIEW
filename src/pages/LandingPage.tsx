// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Database, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

export default function LandingPage() {
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)

  const routeByRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/', { replace: true })
      return
    }
    // read or create profile, then route by role
    const { data: prof } = await supabase
      .from('profiles')
      .select('role, disabled, email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!prof) {
      // create default caregiver profile if not present
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: (user.user_metadata && user.user_metadata.display_name) || '',
        role: 'caregiver',
        disabled: false,
      })
      const { data: prof2 } = await supabase
        .from('profiles')
        .select('role, disabled')
        .eq('id', user.id)
        .single()
      if (prof2?.disabled) {
        await supabase.auth.signOut()
        navigate('/', { replace: true })
        return
      }
      navigate(prof2?.role === 'admin' ? '/admin' : '/caregiver', { replace: true })
      return
    }

    if (prof.disabled) {
      await supabase.auth.signOut()
      navigate('/', { replace: true })
      return
    }
    navigate(prof.role === 'admin' ? '/admin' : '/caregiver', { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        })
        if (signUpErr) throw signUpErr

        const { error: siErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (siErr) throw siErr

        // route by role (creates profile if missing)
        await routeByRole()
      } else {
        const { error: siErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (siErr) throw siErr

        // route by role
        await routeByRole()
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email above first.')
      return
    }
    setSendingReset(true)
    setError(null)
    setInfo(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setInfo('If that email exists, a reset link has been sent.')
    } catch (e: any) {
      setError(e.message || 'Failed to send password reset email')
    } finally {
      setSendingReset(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            CarerView — Daily Functional Assessment Made Easy
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            For family and professional caregivers to record daily observations across ADA and OT
            Activities of Daily Living categories using a simple 1–10 scale. Administrators can view
            system-wide aggregates. Patients do not log in.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-14">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Secure & Private</h3>
              </div>
              <p className="text-slate-600">Only caregivers and admins can access. Patients never log in.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Structured Data</h3>
              </div>
              <p className="text-slate-600">
                Observations captured in consistent categories with 1–10 scoring for longitudinal tracking.
              </p>
            </CardContent>
          </Card>

        <Card>
            <CardContent>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Reports On Demand</h3>
              </div>
              <p className="text-slate-600">Purpose-built for ADL & IADL assessments with standardized definitions.</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth form */}
        <div id="get-started" className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(null); setInfo(null) }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(null); setInfo(null) }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign in
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Display name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Jane Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {info && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
                  <p className="text-blue-700 text-sm">{info}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:opacity-60"
              >
                {isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="text-sm text-blue-700 hover:underline disabled:opacity-60"
              >
                Forgot your password?
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} CarerView — All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
