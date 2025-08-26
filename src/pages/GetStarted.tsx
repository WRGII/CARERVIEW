import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Users, FileCheck, ArrowRight, CheckCircle, Star, Zap, BarChart3, Lock } from 'lucide-react'

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

    const { data, error } = await supabase.rpc('app.bootstrap_login', {
      _display_name: name,
      _email: email
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CareView</h1>
                <p className="text-sm text-slate-500 font-medium">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200/60">
                <Shield className="w-4 h-4" />
                <span className="font-semibold text-sm">HIPAA Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm">
              <Star className="w-4 h-4 mr-2" />
              Trusted by Healthcare Professionals Worldwide
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800">
                  CareView
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Organize your assessments and improve your performance with our secure, 
                ADA/OT-aligned platform designed for healthcare professionals.
              </p>
            </div>

            {/* CTA Section */}
            <div className="pt-8">
              <div className="max-w-md mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h3>
                    <p className="text-slate-600">Enter your details to access your dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-3">
                          Display Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="Enter your full name"
                          className="w-full px-4 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-base font-medium"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="Enter your email address"
                          className="w-full px-4 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-base font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl group text-base"
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Authenticating...
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-2">
                          Access Dashboard
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </span>
                      )}
                    </button>

                    {err && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <p className="text-red-800 font-semibold text-sm">Authentication Error</p>
                        <p className="text-red-700 text-sm mt-1">{err}</p>
                      </div>
                    )}
                  </form>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center leading-relaxed">
                      By signing in, you agree to our secure authentication protocols and data handling practices.
                      <br />
                      <span className="font-semibold">HIPAA aligned • SOC 2 friendly</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-xl">CareView</p>
                <p className="text-slate-400">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-slate-300">© 2024 CareView. All rights reserved.</p>
              <p className="text-slate-400 mt-1">Empowering healthcare professionals worldwide</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}