// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Database, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

type ProfileRow = { role?: 'admin' | 'caregiver' | null }

async function fetchProfileRoleWithRetry(userId: string, tries = 6, delayMs = 300): Promise<'admin' | 'caregiver' | null> {
  for (let i = 0; i < tries; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)           // profiles.id == auth.users.id
      .single<ProfileRow>()
    if (!error && data) return (data.role ?? null) as any
    await new Promise(res => setTimeout(res, delayMs))
  }
  return null
}

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)

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

        const { data: signInData, error: siErr } = await supabase.auth.signInWithPassword({
          email, password,
        })
        if (siErr) throw siErr
        const u = signInData.user
        if (!u) throw new Error('No user returned after sign in')

        const role = (await fetchProfileRoleWithRetry(u.id)) ?? 'caregiver'
        window.location.href = role === 'admin' ? '/admin' : '/caregiver'
      } else {
        const { data, error: siErr } = await supabase.auth.signInWithPassword({ email, password })
        if (siErr) throw siErr
        const u = data.user
        if (!u) throw new Error('No user returned after sign in')

        const role = (await fetchProfileRoleWithRetry(u.id)) ?? 'caregiver'
        window.location.href = role === 'admin' ? '/admin' : '/caregiver'
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // NEW: send reset email
  const handleForgotPassword = async () => {
    setError(null)
    setInfo(null)

    if (!email) {
      setError('Enter your email above, then click “Forgot your password?”.')
      return
    }

    try {
      setSendingReset(true)
      // Use the current origin for the redirect; make sure Supabase “Site URL” matches this host
      const redirectTo = `${window.location.origin}/reset-password`
      const { error: rErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (rErr) throw rErr
      setInfo('Password reset email sent. Please check your inbox.')
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">CarerView</h1>
          <p className="text-xl text-slate-600 mb-6">Daily Functional Assessment System Made Easy</p>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            For family and professional caregivers to record daily observations across
            ADA and OT-aligned Activities of Daily Living categories.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card><CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Shield className="w-6 h-6 text-blue-600" /></div>
              <h3 className="text-lg font-semibold text-slate-900">Secure Access</h3>
            </div>
            <p className="text-slate-600">Email and password authentication with role-based access controls.</p>
          </CardContent></Card>

          <Card><CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg"><Database className="w-6 h-6 text-green-600" /></div>
              <h3 className="text-lg font-semibold text-slate-900">Database-Driven</h3>
            </div>
            <p className="text-slate-600">All categories, questions, and standardized definitions live in secure database with real-time updates.</p>
          </CardContent></Card>

          <Card><CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg"><FileText className="w-6 h-6 text-purple-600" /></div>
              <h3 className="text-lg font-semibold text-slate-900">Professional Reports</h3>
            </div>
            <p className="text-slate-600">Export observations with full details and clean formatting.</p>
          </CardContent></Card>

          <Card><CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg"><Activity className="w-6 h-6 text-orange-600" /></div>
              <h3 className="text-lg font-semibold text-slate-900">ADA/OT Aligned</h3>
            </div>
            <p className="text-slate-600">Purpose-built for ADL & IADL assessments with standardized definitions.</p>
          </CardContent></Card>
        </div>

        {/* Auth form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(null); setInfo(null) }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >Sign Up</button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(null); setInfo(null) }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >Sign In</button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              {isSignUp ? 'Enter your details to create your account' : 'Sign in to access your dashboard'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <label className="block text-sm font-semibold text-slate-700">
                  Display Name
                  <input
                    value={name} onChange={(e) => setName(e.target.value)} required
                    placeholder="Enter your full name"
                    className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                  />
                </label>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="Enter your email address"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              {!isSignUp && (
                <div className="text-right -mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={sendingReset}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {sendingReset ? 'Sending…' : 'Forgot your password?'}
                  </button>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-lg disabled:opacity-50 transition font-semibold shadow-lg hover:shadow-xl group"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isSignUp ? 'Creating account…' : 'Signing in…'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              )}

              {info && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-800 text-sm">{info}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
