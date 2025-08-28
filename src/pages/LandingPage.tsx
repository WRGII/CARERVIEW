// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Database, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

type Role = 'admin' | 'caregiver'
const ADMIN_EMAIL = 'william.griffith@grifii.com'

/**
 * Create (or update) the caller's profile safely and return the role.
 * Uses upsert so we don't rely on a DB trigger racing to create the row.
 */
async function ensureProfile(uid: string, email: string, displayName?: string): Promise<Role> {
  const desiredRole: Role = email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'caregiver'

  // Insert if missing; update if exists (id is PK, so onConflict:'id' is valid)
  const { error: upErr } = await supabase
    .from('profiles')
    .upsert(
      {
        id: uid,                               // must match auth.users.id
        display_name: displayName || email.split('@')[0],
        role: desiredRole,
        disabled: false,
      },
      { onConflict: 'id' }
    )
  if (upErr) throw upErr

  // Read back to be certain
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .single<{ role: Role }>()
  if (error) throw error

  return data?.role ?? desiredRole
}

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create the account if needed
      if (isSignUp) {
        const { error: suErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        })
        if (suErr) throw suErr
      }

      // Sign in
      const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email, password })
      if (siErr) throw siErr
      const u = si.user
      if (!u) throw new Error('No user returned after sign in')

      // Make sure a profile row exists *now* and decide the role
      const role = await ensureProfile(u.id, u.email ?? email, name)

      // Route by role
      window.location.href = role === 'admin' ? '/admin' : '/caregiver'
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
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
            For family and professional caregivers to record daily observations across ADA and OT-aligned
            Activities of Daily Living categories.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Secure Access</h3>
              </div>
              <p className="text-slate-600">
                Email and password authentication with role-based access controls.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Database-Driven</h3>
              </div>
              <p className="text-slate-600">
                All categories, questions, and scoring definitions live in secure database with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Professional Reports</h3>
              </div>
              <p className="text-slate-600">Export observations with full details and clean formatting.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">ADA/OT Aligned</h3>
              </div>
              <p className="text-slate-600">
                Purpose-built for ADL & IADL assessments with standardized definitions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Auth form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                  />
                </label>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition font-semibold shadow-lg hover:shadow-xl group"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export both forms to satisfy any import style
export default LandingPage
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">CarerView</h1>
          <p className="text-xl text-slate-600 mb-6">
            Daily functional assessments made Easy!
          </p>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            For family and professional caregivers to record daily observations across
            ADA and OT-aligned Activities of Daily Living categories.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Secure Access</h3>
              </div>
              <p className="text-slate-600">
                Email and password authentication with role-based access controls.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Database-Driven</h3>
              </div>
              <p className="text-slate-600">
                All observations live in an accessible database with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Professional Reports</h3>
              </div>
              <p className="text-slate-600">
                Export observations with full details and clean formatting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">ADA and OT Aligned</h3>
              </div>
              <p className="text-slate-600">
                Purpose-built for ADL & IADL assessments with standardized definitions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Auth form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-center mb-6">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isSignUp
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    !isSignUp
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              {isSignUp 
                ? 'Enter your details to create your account'
                : 'Sign in to access your dashboard'
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <label className="block text-sm font-semibold text-slate-700">
                  Display Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                  />
                </label>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="mt-2 w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition font-semibold shadow-lg hover:shadow-xl group"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
