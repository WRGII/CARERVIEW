// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Heart, Shield, Users, FileText, ArrowRight, CheckCircle, Clock, Lock } from 'lucide-react'
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

        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password })
        if (siErr) throw siErr

        await routeByRole()
      } else {
        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password })
        if (siErr) throw siErr

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="pt-16 pb-20 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
              <Heart className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
            CarerView
          </h1>
          
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800 mb-8 leading-tight">
            Clarity, when caring feels confusing.
          </h2>
          
          <p className="mt-6 text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Watching someone you love change is hard. CarerView gives you a gentle, simple way to notice what's getting easier, what's getting harder, and how things shift day-to-day—so everyone on the care team talks using the same barometer.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#get-started"
              className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-xl"
            >
              Get Started — Free for Families <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#sample-report"
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-300 px-8 py-4 text-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              See a Sample Report
            </a>
          </div>
          
          <p className="mt-4 text-sm text-slate-500">Start in 60 seconds</p>
        </div>

        {/* Sub-hero Reassurance */}
        <div className="py-16 text-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl mb-20">
          <h3 className="text-3xl font-bold text-slate-800 mb-6">You're not alone.</h3>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Caregiving comes with worry, doubt, and a thousand tiny decisions. CarerView offers a calm, consistent framework—so you can replace "I think…" with shared facts everyone understands.
          </p>
        </div>

        {/* How CarerView Helps */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">A shared language for care</h3>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Simple daily check-ins</h4>
                <p className="text-slate-600 leading-relaxed">
                  Spend 1–3 minutes noting how things went across core Activities of Daily Living. On most days, 3–5 quick check-ins are plenty.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Clear, 1–5 scale</h4>
                <p className="text-slate-600 leading-relaxed">
                  Easy, gentle wording—no medical jargon—grounded in occupational therapy best practices that families can understand.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Trends you can trust</h4>
                <p className="text-slate-600 leading-relaxed">
                  See changes over days and weeks, not just how today felt. Gentle trends highlight when to adjust routines or supports.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-4">Bring everyone together</h4>
                <p className="text-slate-600 leading-relaxed">
                  Share read-only links or PDFs with family and clinicians so discussions start from the same definitions and data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Families Choose CarerView */}
        <div className="py-20 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Less second-guessing. More peace of mind.</h3>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Make doctor visits count</h4>
                    <p className="text-slate-600">Arrive with specific observations instead of fuzzy memories.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Reduce family friction</h4>
                    <p className="text-slate-600">Align siblings and supporters around the same facts and wording.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Spot small shifts early</h4>
                    <p className="text-slate-600">Gentle trends highlight when to adjust routines, medications, or supports.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">Honor your loved one</h4>
                    <p className="text-slate-600">Focus on what they <em>can</em> do today, while tracking where help is needed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Track */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">What you'll track</h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Gentle categories that reflect real daily life
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Activities of Daily Living</h4>
                <div className="space-y-3">
                  {['Bathing & personal hygiene', 'Dressing & grooming', 'Eating & drinking', 'Toileting & continence', 'Mobility & transfers', 'Safety awareness'].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Instrumental Activities</h4>
                <div className="space-y-3">
                  {['Medication management', 'Meals & groceries', 'Housekeeping & laundry', 'Finances & paperwork', 'Communication & memory', 'Transportation & errands'].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-slate-500 mt-8 italic">
            Categories are customizable so CarerView fits your family's reality.
          </p>
        </div>

        {/* Designed for Overwhelmed Days */}
        <div className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h3 className="text-4xl font-bold text-slate-900 mb-12">Designed for overwhelmed days</h3>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Fast</h4>
                <p className="text-slate-600">Log only what's relevant; skip the rest.</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Kind</h4>
                <p className="text-slate-600">Supportive prompts in plain language.</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Private</h4>
                <p className="text-slate-600">You control who sees what, always.</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Portable</h4>
                <p className="text-slate-600">Works on phone, tablet, or computer.</p>
              </div>
            </div>
            
            <div className="mt-12">
              <a
                href="#get-started"
                className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200"
              >
                Create a Free Account
              </a>
            </div>
          </div>
        </div>

        {/* Sample Report Section */}
        <div id="sample-report" className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">See the difference a week makes</h3>
            <p className="text-2xl text-slate-600 mb-8">From "I'm worried" to "Here's what changed."</p>
          </div>
          
          <Card className="max-w-4xl mx-auto border-0 shadow-xl">
            <CardContent className="p-12">
              <h4 className="text-2xl font-semibold text-slate-900 mb-8 text-center">A single page report shows:</h4>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-900 mb-1">Daily notes summarized into clear trends</h5>
                    <p className="text-slate-600">See patterns emerge from your daily observations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-900 mb-1">Gentle flags when support needs shift</h5>
                    <p className="text-slate-600">Know when it's time to adjust care approaches</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-900 mb-1">A printable/shareable view for appointments</h5>
                    <p className="text-slate-600">Bring concrete data to every healthcare conversation</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <button className="inline-flex items-center gap-3 rounded-xl border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200">
                  View a Sample Report
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust & Privacy */}
        <div className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Your family's story stays yours</h3>
            
            <div className="grid gap-8 md:grid-cols-3 mt-12">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">You own your data</h4>
                <p className="text-slate-600">Complete control over your family's information</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Private by default</h4>
                <p className="text-slate-600">Share only with people you invite</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">Secure storage</h4>
                <p className="text-slate-600">Encrypted and protected always</p>
              </div>
            </div>
            
            <div className="mt-8">
              <a href="#privacy" className="text-blue-600 hover:text-blue-700 font-medium underline">
                Read our Privacy Promise
              </a>
            </div>
          </div>
        </div>

        {/* Auth form */}
        <div id="get-started" className="py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Bring calm to the conversation</h3>
              <p className="text-xl text-slate-600">
                Start noticing together, decide together, and care together—with CarerView as your shared compass.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex justify-center mb-6">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(null); setInfo(null) }}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                      isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(null); setInfo(null) }}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                      !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign in
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                      placeholder="How should we address you?"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    placeholder="Choose a secure password"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {info && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <p className="text-blue-700 text-sm">{info}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-60 transition-all duration-200"
                >
                  {isSignUp ? 'Get Started — Free for Families' : 'Welcome back'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 text-center">
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
        </div>

        {/* Footer */}
        <div className="py-16 text-center border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-4">
            Built with caregivers & clinicians. Categories reflect widely used ADL & IADL frameworks and occupational-therapy best practices, translated into everyday language families can use together.
          </p>
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} CarerView App | All rights reserved | a GrifDigi company
          </p>
        </div>
      </div>
    </div>
  )
}