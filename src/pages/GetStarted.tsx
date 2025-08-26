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
      {/* Navigation Header */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">CarerView</h1>
                <p className="text-xs text-slate-500 font-medium">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                <Shield className="w-4 h-4" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-12 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Trusted by Healthcare Professionals
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                  Professional
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                    Assessment Platform
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed max-w-2xl">
                  Streamline functional assessments with our secure, ADA/OT-aligned platform designed for healthcare professionals.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Secure Access</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Token-based authentication with enterprise-grade security</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Multi-Role Access</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Dedicated portals for administrators and caregivers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Standards Compliant</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">ADA/OT aligned assessment standards and protocols</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Real-time Analytics</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">Comprehensive reporting and data visualization tools</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Authentication Form */}
            <div className="lg:col-span-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/60 p-8 lg:p-10">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-6">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">Welcome Back</h2>
                  <p className="text-slate-600 text-lg">Enter your credentials to access your dashboard</p>
                </div>

                {/* Authentication Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Display Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-lg"
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
                        className="w-full px-4 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none group"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Access Dashboard</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    )}
                  </button>

                  {err && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <div>
                          <p className="text-red-800 font-medium">Authentication Error</p>
                          <p className="text-red-700 text-sm mt-1">{err}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>

                {/* Form Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    By signing in, you agree to our secure authentication protocols and data handling practices. 
                    <br />
                    <span className="font-medium">HIPAA compliant • SOC 2 certified</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">CarerView</p>
                <p className="text-sm text-slate-400">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="text-sm text-slate-400 text-center sm:text-right">
              <p>© 2024 CarerView. All rights reserved.</p>
              <p className="mt-1">Empowering healthcare professionals worldwide</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}