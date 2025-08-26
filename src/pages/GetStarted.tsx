import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Activity, Shield, Users, FileCheck, CheckCircle, ArrowRight, Star, Zap, Lock, BarChart3 } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">CareView</h1>
                <p className="text-xs text-slate-500 font-medium">Professional Assessment Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200/60 text-sm">
                <Shield className="w-3.5 h-3.5" />
                <span className="font-medium">HIPAA Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start py-12 lg:py-20">
          
          {/* Left Side - Welcome Content */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm">
                <Star className="w-4 h-4 mr-2" />
                Trusted by Healthcare Professionals
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                  Welcome to 
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                    CareView !
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                  Organize your assessments and improve your performance with us here !
                </p>
              </div>
            </div>

            {/* Try Things Out Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Try things out</h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Feature Card 1 */}
                <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Quick Start</span>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <span>⭐</span>
                          <span>1 Min</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">Set up your profile</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Set up with relevant information such as profile picture, phone number etc
                      </p>
                      <div className="flex items-center justify-between">
                        <button className="text-sm text-slate-600 hover:text-blue-600 transition-colors">
                          Learn more →
                        </button>
                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Advanced</span>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <span>⭐</span>
                          <span>2 Min</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">Create your first assessment</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Set up with relevant information such as patient data, assessment type etc
                      </p>
                      <div className="flex items-center justify-between">
                        <button className="text-sm text-slate-600 hover:text-purple-600 transition-colors">
                          Learn more →
                        </button>
                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                          Create
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Shield className="w-5 h-5 text-white" />, title: 'Secure Access', bg: 'from-green-500 to-green-600' },
                { icon: <Users className="w-5 h-5 text-white" />, title: 'Multi-Role', bg: 'from-purple-500 to-purple-600' },
                { icon: <FileCheck className="w-5 h-5 text-white" />, title: 'Compliant', bg: 'from-orange-500 to-orange-600' },
                { icon: <Lock className="w-5 h-5 text-white" />, title: 'Enterprise', bg: 'from-blue-500 to-blue-600' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/40 hover:bg-white/70 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-br ${feature.bg} rounded-lg shadow-sm`}>
                    {feature.icon}
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Authentication Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/60 p-8">
                
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-6 mx-auto">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Getting Started</h2>
                  <p className="text-slate-600">Enter your details to access your dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Display Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white text-slate-900 placeholder-slate-500 text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl group text-base"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authenticating…
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-2">
                        Access Dashboard 
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>

                  {err && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-800 font-medium text-sm">Authentication Error</p>
                      <p className="text-red-700 text-sm mt-1">{err}</p>
                    </div>
                  )}
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
                    By signing in, you agree to our secure authentication protocols and data handling practices.
                    <br />
                    <span className="font-medium">HIPAA aligned • SOC 2 friendly</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
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
        </div>
      </footer>
    </div>
  )
}