// src/pages/LandingPage.tsx
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, ArrowRight, CircleCheck as CheckCircle, Clock, Lock, Stethoscope, TrendingUp, MessageCircle, HeartHandshake, ScanSearch } from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import AuthForm from '../components/common/AuthForm'

export default function LandingPage() {
  const location = useLocation()

  // Smooth-scroll to #get-started if the page was opened with that hash
  useEffect(() => {
    if (location.hash === '#get-started') {
      setTimeout(() => {
        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [location.hash])

  // --- UI --------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-gray mb-4">
              CarerView
            </h1>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-gray/90 mb-8 leading-tight">
            Better Family and In-Home Caregiving through Clear Observations
          </h2>

          <p className="mt-4 text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            Observing the changes in someone you love can be stressful. And differing opinions among caregivers only adds to that stress...CarerView gives you a simple way to observe and share what's getting easier, what's getting harder, and how things shift day-to-day—so everyone on the care team talks using the same barometer.
          </p>

        </div>

        {/* CARERVIEW 1-5 ADL SCALE */}
        <div className="py-12 sm:py-20 bg-gradient-to-r from-blue-50 to-slate-50 rounded-3xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">
                Activities of Daily Living
              </p>
              <h2 className="text-4xl font-bold text-slate-800 tracking-wide mb-6">
                CarerView 1–5 Scale
              </h2>
              <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
                Our simple 1-5 scale helps you observe and communicate changes in daily living activities with clarity and consistency.
              </p>
            </div>

            {/* Scale — responsive grid: 2-col on mobile, 5-col on sm+ */}
            <div className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-peach-blush py-6 px-3 flex flex-col items-center justify-center text-slate-700 col-span-1 sm:rounded-l-xl">
                  <span className="text-3xl font-bold mb-1">1</span>
                  <span className="text-xs font-semibold text-center leading-snug">Total Assistance</span>
                </div>
                <div className="bg-peach-blush/70 py-6 px-3 flex flex-col items-center justify-center text-slate-700">
                  <span className="text-3xl font-bold mb-1">2</span>
                  <span className="text-xs font-semibold text-center leading-snug">Constant Shared Effort</span>
                </div>
                <div className="bg-cyan-primary/40 py-6 px-3 flex flex-col items-center justify-center text-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-3xl font-bold mb-1">3</span>
                  <span className="text-xs font-semibold text-center leading-snug">Independent with Support</span>
                </div>
                <div className="bg-mint-green/70 py-6 px-3 flex flex-col items-center justify-center text-slate-700">
                  <span className="text-3xl font-bold mb-1">4</span>
                  <span className="text-xs font-semibold text-center leading-snug">Independent with Difficulty</span>
                </div>
                <div className="bg-mint-green py-6 px-3 flex flex-col items-center justify-center text-slate-700 sm:rounded-r-xl">
                  <span className="text-3xl font-bold mb-1">5</span>
                  <span className="text-xs font-semibold text-center leading-snug">Fully Independent</span>
                </div>
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-slate-400 font-medium">More assistance needed</span>
                <span className="text-xs text-slate-400 font-medium">More independent</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-gray/70 text-lg">
                From "Total Assistance" to "Fully Independent" — a clear framework for observing daily living activities
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/create-account"
                className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
              >
                Begin Observations Today <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/why"
                className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
                aria-label="Why your family needs CarerView"
              >
                Why your family needs CarerView
              </Link>
            </div>

            <p className="mt-4 text-center text-sm text-slate-gray/60">Your Observations are Vital for their Care Plan!</p>
          </div>
        </div>

        {/* Less confusion – Shared Language of Care */}
        <div className="py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Why it works</p>
            <h3 className="text-4xl font-bold text-slate-gray mb-5">Less confusion &mdash; Shared Language of Care</h3>
            <p className="text-xl text-slate-gray/70 max-w-2xl mx-auto leading-relaxed">
              One consistent framework that brings family members, clinicians, and in-home caregivers onto the same page.
            </p>
          </div>

          {/* Top row: 2 feature cards */}
          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-warm-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-cyan-primary/15 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-cyan-primary/25 transition-colors duration-300">
                  <Clock className="w-7 h-7 text-cyan-primary" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-3">Simple check-ins</h4>
                <p className="text-slate-gray/75 leading-relaxed">
                  Spend just a few minutes noting how things went across core Activities of Daily Living. Create quick check-ins or complete Observations anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-warm-white group">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-peach-blush/60 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-peach-blush/80 transition-colors duration-300">
                  <TrendingUp className="w-7 h-7 text-slate-gray" />
                </div>
                <h4 className="text-lg font-semibold text-slate-gray mb-3">Trends you can trust</h4>
                <p className="text-slate-gray/75 leading-relaxed">
                  Not just how it felt today — observe changes over days, weeks, and months. Patterns highlight when to adjust routines or supports.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom row: 4 benefit items */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-cyan-primary/8 to-cyan-primary/3 rounded-2xl p-6 border border-cyan-primary/15 hover:border-cyan-primary/30 transition-colors duration-300">
              <div className="w-11 h-11 bg-cyan-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5 text-cyan-primary" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">Make doctor visits count</h4>
              <p className="text-slate-gray/75 leading-relaxed">Arrive with specific observations instead of fuzzy memories.</p>
            </div>

            <div className="bg-gradient-to-br from-mint-green/20 to-mint-green/8 rounded-2xl p-6 border border-mint-green/30 hover:border-mint-green/50 transition-colors duration-300">
              <div className="w-11 h-11 bg-mint-green/40 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">Reduce family friction</h4>
              <p className="text-slate-gray/75 leading-relaxed">Align siblings and supporters around the same facts and wording.</p>
            </div>

            <div className="bg-gradient-to-br from-peach-blush/40 to-peach-blush/15 rounded-2xl p-6 border border-peach-blush/40 hover:border-peach-blush/60 transition-colors duration-300">
              <div className="w-11 h-11 bg-peach-blush/60 rounded-xl flex items-center justify-center mb-4">
                <ScanSearch className="w-5 h-5 text-slate-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">Spot small shifts early</h4>
              <p className="text-slate-gray/75 leading-relaxed">Gentle trends highlight when to adjust routines, medications, or supports.</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-primary/8 to-mint-green/10 rounded-2xl p-6 border border-slate-200 hover:border-cyan-primary/25 transition-colors duration-300">
              <div className="w-11 h-11 bg-cyan-primary/15 rounded-xl flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5 text-cyan-primary" />
              </div>
              <h4 className="text-lg font-semibold text-slate-gray mb-2">Honor your loved one</h4>
              <p className="text-slate-gray/75 leading-relaxed">Focus on what they <em>can</em> do today, while observing where help is needed.</p>
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
                aria-label="Why your family needs CarerView"
              >
                Why your family needs CarerView
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

        {/* Auth form */}
        <div id="get-started" className="py-20">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-slate-gray mb-4">
                Get started today
              </h3>
              <p className="text-lg text-slate-gray/75 leading-relaxed">
                Create an account or sign in to return to your caregiver dashboard.
              </p>
            </div>
            <AuthForm initialMode="signin" showToggle={true} />
          </div>
        </div>

      </div>
    </div>
  )
}