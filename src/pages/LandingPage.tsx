// src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Heart, Shield, Users, FileText, ArrowRight, CircleCheck as CheckCircle, Clock, Lock } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'

export default function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)

  // Smooth-scroll to #get-started if the page was opened with that hash
  useEffect(() => {
    if (location.hash === '#get-started') {
      setTimeout(() => {
        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [location.hash])

  // --- helpers ---------------------------------------------------------------

  /** Ensure a profile exists and is valid. Returns the resulting profile. */
  async function ensureProfile(userId: string, emailAddr: string | null, displayName: string | null) {
    const { data: prof, error: selErr } = await supabase
      .from('profiles')
      .select('id, role, disabled')
      .eq('id', userId)
      .maybeSingle()
    if (selErr) throw selErr

    if (!prof) {
      const { error: upErr } = await supabase.from('profiles').upsert({
        id: userId,
        email: emailAddr ?? '',
        display_name: displayName ?? '',
        role: 'caregiver',
        disabled: false,
      })
      if (upErr) throw upErr
      return { role: 'caregiver', disabled: false }
    }

    return prof
  }

  /** Route the newly-signed-in user based on their profile role. */
  async function routeAfterLogin() {
    // make sure session is live
    await supabase.auth.getSession()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Signed in, but no active session was found.')

    const prof = await ensureProfile(
      user.id,
      user.email ?? null,
      user.user_metadata?.display_name ?? null
    )

    if (prof.disabled) {
      await supabase.auth.signOut()
      throw new Error('Account disabled. Please contact support.')
    }

    navigate(prof.role === 'admin' ? '/admin' : '/caregiver', { replace: true })
  }

  // --- submit handlers -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      const { data, error: siErr } = await supabase.auth.signInWithPassword({ email, password })
      if (siErr) throw siErr

      // Defensive: make sure we actually got a user back
      const user = data?.user
      if (!user) {
        throw new Error('Sign-in failed. Please try again.')
      }

      await routeAfterLogin()
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed'
      // Normalize common Supabase error string
      setError(
        msg === 'Invalid login credentials'
          ? 'Incorrect email or password. Please check your credentials or try resetting your password.'
          : msg
      )
    } finally {
      // Always clear the button state even if we navigated
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
      setError(e?.message || 'Failed to send password reset email')
    } finally {
      setSendingReset(false)
    }
  }

  // --- UI --------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-12 pb-20 text-center">
          <div className="flex flex-col items-center justify-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-gray mb-4">
              CarerView
            </h1>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-gray/90 mb-8 leading-tight">
            Better Caregiving through Clear Observations
          </h2>

          <p className="mt-6 text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            Observing the changes in someone you love can be stressful. And differing opinions among caregivers only adds to that stress...CarerView gives you a simple way to observe and share what's getting easier, what's getting harder, and how things shift day-to-day—so everyone on the care team talks using the same barometer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* REVISED: go to Create Account wizard */}
            <Link
              to="/create-account"
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              Begin Observations Today <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/why"
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label="Why you need CarerView"
            >
              Why you need CarerView
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-gray/60">Your Observations are Vital for their Care Plan!</p>
        </div>

        {/* CARERVIEW 1-5 ADL SCALE */}
        <div className="py-20 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 tracking-wide mb-6">
                CarerView 1-5 ADL Scale
              </h2>
              <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
                Our simple 1-5 scale helps you observe and communicate changes in daily living activities with clarity and consistency.
              </p>
            </div>

            {/* Horizontal Scale */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👎</span>
              </div>
              <div className="flex flex-1 max-w-4xl">
                <div className="flex-1 bg-peach-blush min-h-[120px] rounded-l-lg flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-bold mb-2">1</span>
                  <span className="text-sm font-semibold text-center px-2">Total Assistance</span>
                </div>
                <div className="flex-1 bg-peach-blush/70 min-h-[120px] flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-bold mb-2">2</span>
                  <span className="text-sm font-semibold text-center px-2">Constant Shared Effort</span>
                </div>
                <div className="flex-1 bg-cyan-primary/40 min-h-[120px] flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-bold mb-2">3</span>
                  <span className="text-sm font-semibold text-center px-2">Independent with Support</span>
                </div>
                <div className="flex-1 bg-mint-green/70 min-h-[120px] flex flex-col items-center justify-center text-slate-gray">
                  <span className="text-3xl font-bold mb-2">4</span>
                  <span className="text-sm font-semibold text-center px-2">Independent with Difficulty</span>
                </div>
                <div className="flex-1 bg-mint-green min-h-[120px] rounded-r-lg flex flex-col items-center justify-center text-slate-gray">
                  <span className="text-3xl font-bold mb-2">5</span>
                  <span className="text-sm font-semibold text-center px-2">Fully Independent</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">👍</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-gray/70 text-lg">
                From "Total Assistance" to "Fully Independent" — a clear framework for observing daily living activities
              </p>
            </div>
          </div>
        </div>

        {/* A shared language for care */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">A shared language for care</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Simple check-ins</h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Spend just a few  minutes noting how things went across core Activities of Daily Living. Create quick check-ins or complete Observations anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Clear 1–5 scale</h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Easy wording —no medical jargon— grounded in occupational therapy best practices that families can understand.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Trends you can trust</h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Not just how it felt today, but observe changes over days - weeks - months. Observed trends highlight when to adjust routines or supports.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Bring everyone together</h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Share private Observations with family and clinicians so discussions start from the same definitions and data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Families Choose CarerView */}
        <div className="py-20 bg-gradient-to-r from-mint-green/30 to-peach-blush/20 rounded-3xl">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-slate-gray mb-6">Less second-guessing. More peace of mind.</h3>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-warm-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-gray mb-2">Make doctor visits count</h4>
                    <p className="text-slate-gray/80">Arrive with specific observations instead of fuzzy memories.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-slate-gray" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-gray mb-2">Reduce family friction</h4>
                    <p className="text-slate-gray/80">Align siblings and supporters around the same facts and wording.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-peach-blush rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-warm-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-gray mb-2">Spot small shifts early</h4>
                    <p className="text-slate-gray/80">Gentle trends highlight when to adjust routines, medications, or supports.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-warm-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-slate-gray mb-2">Honor your loved one</h4>
                    <p className="text-slate-gray/80">
                      Focus on what they <em>can</em> do today, while observing where help is needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Report Section */}
        <div id="sample-report" className="py-20">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">See the difference just one Observation makes</h3>
            <p className="text-2xl text-slate-gray/80 mb-8">From "I'm worried" to "Here's what changed."</p>

            <div className="mt-8">
              <Link
                to="/why"
                className="inline-flex items-center gap-3 rounded-xl border-2 border-cyan-primary px-8 py-4 text-lg font-semibold text-cyan-primary hover:bg-cyan-primary/10 transition-all duration-200"
                aria-label="Why you need CarerView"
              >
                Why you need CarerView
              </Link>
            </div>
          </div>
        </div>

        {/* Trust & Privacy */}
        <div className="py-20 bg-gradient-to-r from-mint-green/20 to-cyan-primary/10 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">Your family's story stays yours</h3>

            <div className="grid gap-8 md:grid-cols-3 mt-12">
              <div>
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">You own your data</h4>
                <p className="text-slate-gray/80">Complete control over your family's information</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Private by default</h4>
                <p className="text-slate-gray/80">Share only with people you invite</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Secure storage</h4>
                <p className="text-slate-gray/80">Encrypted and protected always</p>
              </div>
            </div>

            <div className="mt-8">
              <a href="#privacy" className="text-cyan-primary hover:text-cyan-hover font-medium underline">
                Read our Privacy Promise
              </a>
            </div>
          </div>
        </div>

        {/* You're Not Alone - Moved from position 2 to position 7 */}
        <div className="py-16 text-center bg-gradient-to-r from-peach-blush/30 to-mint-green/20 rounded-3xl mb-20">
          <h3 className="text-3xl font-bold text-slate-gray mb-6">You're not alone.</h3>
          <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto leading-relaxed">
            Caregiving comes with worry, doubt, and a thousand tiny decisions. CarerView offers a calm, consistent framework—so you can replace "I think…" with shared facts everyone understands.
          </p>

          {/* Testimonial */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-warm-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-gray/10">
              <div className="text-2xl text-cyan-primary mb-2">"</div>
              <blockquote className="text-lg text-slate-gray/90 italic leading-relaxed mb-6">
                My brother and my two cousins are the primary caregivers for our Auntie. Our emotions around her independence ability caused a lot of arguments. We love CarerView because it lets us have a common and easy system to discuss our observations of the entire situation.
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-primary/20 to-mint-green/30 rounded-full flex items-center justify-center mr-4">
                  <span className="text-cyan-primary font-bold text-lg">BG</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-gray">Billy G.</div>
                  <div className="text-slate-gray/70 text-sm">Denver, CO USA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auth form (Sign In only) */}
        <div id="get-started" className="py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-slate-gray mb-6">Sign in to your account</h3>
              <p className="text-xl text-slate-gray/80">
                Return to your caregiver dashboard.
              </p>
            </div>

            <div className="bg-warm-white p-8 rounded-2xl shadow-xl border border-slate-gray/20">
              {/* Logo in top left corner */}
              <div className="flex justify-start mb-6">
                <img
                  src="/CareView_logo_1_colored_highres.png"
                  alt="CarerView Logo"
                  className="w-14 h-14 md:w-16 md:h-16 object-contain"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="Your password"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-peach-blush/30 border border-peach-blush p-4">
                    <p className="text-slate-gray text-sm">{error}</p>
                  </div>
                )}

                {info && (
                  <div className="rounded-lg bg-mint-green/30 border border-mint-green p-4">
                    <p className="text-slate-gray text-sm">{info}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-primary px-6 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                  className="text-sm text-cyan-primary hover:underline disabled:opacity-60"
                >
                  Forgot your password?
                </button>

                <Link to="/create-account" className="text-sm text-cyan-primary hover:underline">
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}