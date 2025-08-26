import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Users, FileCheck } from 'lucide-react'

type BootRow = { raw_token?: string; role?: 'admin' | 'caregiver' }

export default function GetStarted() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)

    const { data, error } = await supabase.rpc('bootstrap_login', {
      _display_name: name,
      _email: email,
    })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    const row: BootRow | undefined = Array.isArray(data) ? data[0] : (data as any)
    const token = row?.raw_token
    const role = row?.role
    if (!token || !role) {
      setErr('Login failed — missing token or role.')
      return
    }

    const dest = role === 'admin' ? '/admin' : '/caregiver'
    window.location.href = `${dest}?token=${encodeURIComponent(token)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CarerView</h1>
                <p className="text-xs text-slate-500">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              Secure • Compliant • Professional
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <Shield className="w-4 h-4 mr-2" />
                  HIPAA Compliant Platform
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                  Professional
                  <span className="text-blue-600 block">Assessment Platform</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Streamline functional assessments with our secure, ADA/OT-aligned platform designed for healthcare professionals.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Secure Access</p>
                    <p className="text-xs text-slate-600">Token-based authentication</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Multi-Role</p>
                    <p className="text-xs text-slate-600">Admin & caregiver portals</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileCheck className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Compliant</p>
                    <p className="text-xs text-slate-600">ADA/OT aligned standards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sign In Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                  <p className="text-slate-600">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Display Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      'Access Dashboard'
                    )}
                  </button>

                  {err && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <p className="text-red-700 text-sm font-medium">{err}</p>
                      </div>
                    </div>
                  )}
                </form>

                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    By signing in, you agree to our secure authentication protocols and data handling practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">CarerView</p>
                <p className="text-xs text-slate-400">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 CarerView. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}