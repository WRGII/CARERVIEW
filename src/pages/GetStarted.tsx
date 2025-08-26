import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Users, FileCheck, CheckCircle, ArrowRight } from 'lucide-react'

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
    window.location.href = \`${dest}?token=${encodeURIComponent(token)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CareView</h1>
                <p className="text-xs text-slate-500 font-medium">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                <Shield className="w-4 h-4" />
                <span className="font-medium">HIPAA Ready</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="py-12 lg:py-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left */}
          <section className="lg:col-span-7 space-y-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
              <CheckCircle className="w-4 h-4 mr-2" /> Trusted by Healthcare Professionals
            </span>
            <header className="space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                Professional
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                  Assessment Platform
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl">
                Streamline functional assessments with our secure, ADA/OT-aligned platform designed for healthcare professionals.
              </p>
            </header>
          </section>

          {/* Right - Form */}
          <section className="lg:col-span-5">
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl border border-slate-200/60 p-8 lg:p-10">
              <div className="text-center mb-8">
                <div className="grid place-items-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-6">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome</h3>
                <p className="text-slate-600 text-lg">Enter your details to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      Authenticating…
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      Access Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>

                {err && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-800 font-medium">Authentication Error</p>
                    <p className="text-red-700 text-sm mt-1">{err}</p>
                  </div>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  By signing in, you agree to our secure authentication protocols and data handling practices. <br />
                  <span className="font-medium">HIPAA aligned • SOC 2 friendly (MVP)</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid place-items-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">CareView</p>
              <p className="text-sm text-slate-400">Professional Assessment Platform</p>
            </div>
          </div>
          <div className="text-sm text-slate-400 text-center sm:text-right">
            <p>© 2024 CareView. All rights reserved.</p>
            <p className="mt-1">Empowering healthcare professionals worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}