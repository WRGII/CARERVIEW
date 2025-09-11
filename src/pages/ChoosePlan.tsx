// src/pages/ChoosePlan.tsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan } from '../hooks/useUserPlan'
import type { PlanId } from '../hooks/useUserPlan'
import {
  currentMonthWindowUtc,
  currentWeekWindowUtc,
  first30dWindowUtc,
} from '../lib/subPeriod'
import { useSiteSettings } from '../hooks/useSiteSettings'
import Footer from '../components/common/Footer'

export default function ChoosePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: plan, isLoading } = useUserPlan()
  const { data: settings } = useSiteSettings()

  const [busy, setBusy] = React.useState<PlanId | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  // coupon UI (logic will be connected to Stripe later)
  const [coupon, setCoupon] = React.useState('')
  const [couponMsg, setCouponMsg] = React.useState<string | null>(null)

  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true'
  const logoUrl = settings?.logo_url || '/CareView_logo_1_colored_highres.png'

  // If already on an active plan, bounce to caregiver
  React.useEffect(() => {
    if (!requireSub) return
    if (!isLoading && plan?.status === 'active' && plan.plan_id) {
      navigate('/caregiver', { replace: true })
    }
  }, [requireSub, isLoading, plan, navigate])

  const upsertLocalSub = async (
    plan_id: PlanId,
    startISO: string,
    endISO: string
  ) => {
    if (!user?.id) throw new Error('No user')
    const { error } = await supabase
      .schema('app')
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id,
        status: 'active',
        current_period_start: startISO,
        current_period_end: endISO,
      })
    if (error) throw error
  }

  const choosePrimary = async () => {
    try {
      setErr(null)
      setBusy('primary_weekly')
      const { start, end } = currentWeekWindowUtc()
      await upsertLocalSub('primary_weekly', start, end)
      navigate('/caregiver', { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Failed to choose Primary plan')
    } finally {
      setBusy(null)
    }
  }

  const chooseOccasional = async () => {
    try {
      setErr(null)
      setBusy('occasional_monthly')
      const { start, end } = currentMonthWindowUtc()
      await upsertLocalSub('occasional_monthly', start, end)
      navigate('/caregiver', { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Failed to choose Occasional plan')
    } finally {
      setBusy(null)
    }
  }

  const chooseFree = async () => {
    try {
      setErr(null)
      setBusy('free')
      if (!user?.id) throw new Error('No user')
      // anchor the 30-day window on profile.created_at
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .maybeSingle()
      if (error) throw error
      const { start, end } = first30dWindowUtc(profile?.created_at)
      await upsertLocalSub('free', start, end)
      navigate('/caregiver', { replace: true })
    } catch (e: any) {
      setErr(e?.message || 'Failed to choose Free plan')
    } finally {
      setBusy(null)
    }
  }

  // temporary coupon handler (placeholder until Stripe integration)
  const onApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupon.trim()) {
      setCouponMsg('Enter a coupon code.')
      return
    }
    setCouponMsg('Coupon support coming soon. Your code has been noted.')
    // Optional: stash locally so we can pick it up post-Stripe:
    try {
      localStorage.setItem('cv_pending_coupon', coupon.trim())
    } catch {}
  }

  if (!requireSub) {
    return (
      <div className="min-h-screen bg-warm-white">
        <div className="max-w-5xl mx-auto p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-slate-800">Subscriptions disabled</h1>
            <Link to="/" aria-label="Back to home">
              <img
                src={logoUrl}
                alt="CarerView"
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
            </Link>
          </header>

          <p className="text-slate-600">
            This environment does not require a plan.&nbsp;
            <button
              className="underline"
              onClick={() => navigate('/caregiver', { replace: true })}
            >
              Continue
            </button>
          </p>
        </div>
        <Footer className="mt-12" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <div className="max-w-6xl mx-auto w-full p-6 flex-1">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Choose your plan</h1>
          <Link to="/" aria-label="Back to home">
            <img
              src={logoUrl}
              alt="CarerView"
              className="w-10 h-10 object-contain"
              loading="lazy"
            />
          </Link>
        </header>

        <p className="text-slate-600 mb-4">
          You can switch plans later. Billing via Stripe will be added soon—no charges yet.
        </p>

        {/* Coupon input (placeholder) */}
        <form onSubmit={onApplyCoupon} className="mb-6 flex flex-col sm:flex-row gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Have a coupon? Enter it here"
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 bg-white"
            aria-label="Coupon code"
          />
          <button
            type="submit"
            className="rounded-xl px-4 py-2 border bg-slate-800 text-white hover:bg-slate-900"
          >
            Apply
          </button>
        </form>
        {couponMsg && (
          <div className="mb-4 text-sm text-slate-700">{couponMsg}</div>
        )}

        {err && (
          <div className="mb-4 rounded-md border border-peach-blush bg-peach-blush/20 p-3 text-sm text-slate-800">
            {err}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {/* Primary */}
          <div className="border rounded-2xl p-5 bg-white">
            <div className="text-lg font-semibold">Primary Caregiver</div>
            <div className="text-2xl font-bold mt-1">
              $1<span className="text-base font-medium text-slate-500">/week</span>
            </div>
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              <li>• Up to 7 observations per week</li>
              <li>• Best for daily/primary carers</li>
            </ul>
            <button
              onClick={choosePrimary}
              disabled={busy !== null}
              className="mt-4 w-full rounded-xl py-2 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              {busy === 'primary_weekly' ? 'Choosing…' : 'Choose Primary'}
            </button>
          </div>

          {/* Occasional */}
          <div className="border rounded-2xl p-5 bg-white">
            <div className="text-lg font-semibold">Occasional Caregiver</div>
            <div className="text-2xl font-bold mt-1">
              $3<span className="text-base font-medium text-slate-500">/month</span>
            </div>
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              <li>• 1 observation per month</li>
              <li>• Casual / backup carers</li>
            </ul>
            <button
              onClick={chooseOccasional}
              disabled={busy !== null}
              className="mt-4 w-full rounded-xl py-2 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              {busy === 'occasional_monthly' ? 'Choosing…' : 'Choose Occasional'}
            </button>
          </div>

          {/* Free */}
          <div className="border rounded-2xl p-5 bg-white">
            <div className="text-lg font-semibold">Free</div>
            <div className="text-2xl font-bold mt-1">$0</div>
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              <li>• 3 total observations</li>
              <li>• Only in the first 30 days</li>
              <li>• Upgrade anytime</li>
            </ul>
            <button
              onClick={chooseFree}
              disabled={busy !== null}
              className="mt-4 w-full rounded-xl py-2 border bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60"
            >
              {busy === 'free' ? 'Choosing…' : 'Choose Free'}
            </button>
          </div>
        </div>
      </div>

      {/* Global footer */}
      <Footer />
    </div>
  )
}
