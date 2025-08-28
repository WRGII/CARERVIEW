import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Database, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

type BootRow = { raw_token?: string; role?: 'admin' | 'caregiver' }

export const LandingPage: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)

    // Schema-qualified RPCs (matches Supabase backend)
    const { data, error } = await supabase.rpc('bootstrap_login', {
      _display_name: name,
      _email: email,
    })

    setLoading(false)
    if (error) { setErr(error.message); return }

    const row: BootRow | undefined = Array.isArray(data) ? data[0] : (data as any)
    const token = row?.raw_token
    const role = row?.role
    if (!token || !role) { setErr('Login failed — missing token or role.'); return }

    const dest = role === 'admin' ? '/admin' : '/caregiver'
    window.location.href = `${dest}?token=${encodeURIComponent(token)}`
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
          <p className="text-xl text-slate-600 mb-6">
            Daily Functional Assessment System Made Easy
          </p>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            For family and professional caregivers to record daily observations across
            ADA and OT-aligned ADL & IADL categories.
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
                Token-based access with role-aware controls for administrators and caregivers.
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
              <p className="text-slate-600">
                Export observations to with full details and clean formatting.
              </p>
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

        {/* Registration card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
              Get Started
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              Enter your details to access your dashboard. Your email decides your role.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition font-semibold shadow-lg hover:shadow-xl group"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing dashboard…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Access Caregiver Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              {err && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm mt-1">{err}</p>
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