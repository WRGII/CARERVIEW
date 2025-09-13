// src/pages/LandingPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Heart, Shield, Users, FileText, ArrowRight, CheckCircle, Clock, Lock } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import Footer from '../components/common/Footer'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchChoosePlanAssets } from '../hooks/usePrefetchStatic'

export default function LandingPage() {
  const navigate = useNavigate()

  // react-query client (used to pre-warm Choose Plan)
  const queryClient = useQueryClient()
  const kickoffPrefetch = React.useCallback(() => {
    prefetchChoosePlanAssets(queryClient)
  }, [queryClient])

  const [isSignUp, setIsSignUp] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [sendingReset, setSendingReset] = useState(false)

  // --- helpers ---------------------------------------------------------------

  const upsertProfileIfMissing = async (uid: string, displayName: string, emailAddr: string) => {
    const { data: prof, error: selErr } = await supabase
      .from('profiles')
      .select('id, disabled, role')
      .eq('id', uid)
      .maybeSingle()
    if (selErr) throw selErr

    if (!prof) {
      const { error: upErr } = await supabase.from('profiles').upsert({
        id: uid,
        email: emailAddr ?? '',
        display_name: displayName ?? '',
        role: 'caregiver',
        disabled: false,
      })
      if (upErr) throw upErr
    } else if (prof.disabled) {
      await supabase.auth.signOut()
      throw new Error('Account disabled. Please contact support.')
    }
  }

  const routeByRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      navigate('/', { replace: true })
      return
    }

    const { data: prof } = await supabase
      .from('profiles')
      .select('role, disabled, email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!prof) {
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

  // --- submit handlers -------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    // 👇 warm up Choose Plan data ASAP for faster subsequent load
    kickoffPrefetch()

    try {
      if (isSignUp) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name } },
        })
        if (signUpErr) throw signUpErr

        const user = data.user
        const session = data.session // null if email confirmation is required

        if (session && user?.id) {
          await upsertProfileIfMissing(
            user.id,
            name ?? user.user_metadata?.display_name ?? '',
            user.email ?? ''
          )
          // Go to plan choice first for new accounts
          navigate('/choose-plan', { replace: true })
        } else {
          setInfo('Check your inbox to confirm your email, then sign in to choose a plan.')
        }
      } else {
        const { data, error: siErr } = await supabase.auth.signInWithPassword({ email, password })
        if (siErr) throw siErr

        const user = data.user
        if (user?.id) {
          await upsertProfileIfMissing(
            user.id,
            user.user_metadata?.display_name ?? '',
            user.email ?? ''
          )
        }
        await routeByRole()
      }
    } catch (err: any) {
      if (err?.message === 'Invalid login credentials') {
        setError(
          'Incorrect email or password. Please check your credentials or try resetting your password.'
        )
      } else {
        setError(err?.message || 'Authentication failed')
      }
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
            Clear Observations for Better Caregiving
          </h2>

          <p className="mt-6 text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            Observing the changes in someone you love can be stressful. CarerView gives you a simple way to observe and share what's getting easier, what's getting harder, and how things shift day-to-day—so everyone on the care team talks using the same barometer.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#get-started"
              onMouseEnter={kickoffPrefetch}
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              Simple to start now <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#sample-report"
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
            >
              See a Sample Report
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-gray/60">Start in 60 seconds</p>
        </div>

        {/* Sub-hero Reassurance */}
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

        {/* How CarerView Helps */}
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
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Simple daily check-ins</h4>
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
                <h4 className="text-xl font-semibold text-slate-gray mb-4">Clear, 1–5 scale</h4>
                <p className="text-slate-gray/80 leading-relaxed">
                  Easy, gentle wording—no medical jargon—grounded in occupational therapy best practices that families can understand.
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
                  See changes over days and weeks, not just how today felt. Gentle trends highlight when to adjust routines or supports.
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
                    <CheckCircle className="w-5 h-5 text-slate-gray" />
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
                      Focus on what they <em>can</em> do today, while tracking where help is needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Track */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">What you'll track</h3>
            <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
              Gentle categories that reflect real daily life
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  Activities of Daily Living
                </h4>
                <div className="space-y-3">
                  {[
                    'Bathing & personal hygiene',
                    'Dressing & grooming',
                    'Eating & drinking',
                    'Toileting & continence',
                    'Mobility & transfers',
                    'Safety awareness',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-cyan-primary rounded-full"></div>
                      <span className="text-slate-gray">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  Instrumental Activities
                </h4>
                <div className="space-y-3">
                  {[
                    'Medication management',
                    'Meals & groceries',
                    'Housekeeping & laundry',
                    'Finances & paperwork',
                    'Communication & memory',
                    'Transportation & errands',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-mint-green rounded-full"></div>
                      <span className="text-slate-gray">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-slate-gray/60 mt-8 italic">
            Observations are custom so CarerView fits your family's reality.
          </p>
        </div>

        {/* Designed for Overwhelmed Days */}
        <div className="py-20 bg-gradient-to-r from-peach-blush/20 to-mint-green/30 rounded-3xl">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h3 className="text-4xl font-bold text-slate-gray mb-12">Designed for overwhelmed days</h3>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Fast</h4>
                <p className="text-slate-gray/80">Log only what's relevant; skip the rest.</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Kind</h4>
                <p className="text-slate-gray/80">Supportive prompts in plain language.</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Private</h4>
                <p className="text-slate-gray/80">You control who sees what, always.</p>
              </div>

              <div>
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-2">Portable</h4>
                <p className="text-slate-gray/80">Works on phone, tablet, or computer.</p>
              </div>
            </div>

            <div className="mt-12">
              <a
                href="#get-started"
                onMouseEnter={kickoffPrefetch}
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200"
              >
                Begin today
              </a>
            </div>
          </div>
        </div>

        {/* Sample Report Section */}
        <div id="sample-report" className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">See the difference a week makes</h3>
            <p className="text-2xl text-slate-gray/80 mb-8">From "I'm worried" to "Here's what changed."</p>
          </div>

          <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-warm-white">
            <CardContent className="p-12">
              <h4 className="text-2xl font-semibold text-slate-gray mb-8 text-center">
                A single page report shows:
              </h4>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-cyan-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-warm-white" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-gray mb-1">
                      Daily notes summarized into clear trends
                    </h5>
                    <p className="text-slate-gray/80">See patterns emerge from your daily observations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-mint-green rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-slate-gray" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-gray mb-1">
                      Gentle flags when support needs shift
                    </h5>
                    <p className="text-slate-gray/80">Know when it's time to adjust care approaches</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-peach-blush rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-slate-gray" />
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-slate-gray mb-1">
                      A printable view for appointments
                    </h5>
                    <p className="text-slate-gray/80">Bring concrete data to every healthcare conversation</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button className="inline-flex items-center gap-3 rounded-xl border-2 border-cyan-primary px-8 py-4 text-lg font-semibold text-cyan-primary hover:bg-cyan-primary/10 transition-all duration-200">
                  View a Sample Report
                </button>
              </div>
            </CardContent>
          </Card>
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

        {/* Auth form */}
        <div id="get-started" className="py-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-slate-gray mb-6">Bring calm to the conversation</h3>
              <p className="text-xl text-slate-gray/80">
                Start noticing together, decide together, and care together—with CarerView as your shared compass.
              </p>
            </div>

            <div className="bg-warm-white p-8 rounded-2xl shadow-xl border border-slate-gray/20">
              {/* Logo in top left corner */}
              <div className="flex justify-start mb-6">
                <img
                  src="/CareView_logo_1_colored_highres.png"
                  alt="CarerView Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <div className="flex justify-center mb-6">
                <div className="flex bg-slate-gray/10 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setError(null)
                      setInfo(null)
                      kickoffPrefetch()
                    }}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                      isSignUp ? 'bg-warm-white text-slate-gray shadow-sm' : 'text-slate-gray/70 hover:text-slate-gray'
                    }`}
                  >
                    Create account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setError(null)
                      setInfo(null)
                      kickoffPrefetch()
                    }}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition ${
                      !isSignUp ? 'bg-warm-white text-slate-gray shadow-sm' : 'text-slate-gray/70 hover:text-slate-gray'
                    }`}
                  >
                    Sign in
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-slate-gray mb-2">Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                      placeholder="How should we address you?"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-2">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border-slate-gray/30 shadow-sm focus:border-cyan-primary focus:ring-cyan-primary px-4 py-3 text-base bg-warm-white text-slate-gray"
                    placeholder="your.email@example.com"
                    onFocus={kickoffPrefetch}
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
                    placeholder="Choose a secure password"
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
                  onMouseEnter={kickoffPrefetch}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-primary px-6 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200"
                >
                  {isSignUp ? 'Get Started' : 'Welcome back'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handlePasswordReset}
                  disabled={sendingReset}
                  className="text-sm text-cyan-primary hover:underline disabled:opacity-60"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
