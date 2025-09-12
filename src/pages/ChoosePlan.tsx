// src/pages/ChoosePlan.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan } from '../hooks/useUserPlan'
import type { PlanId } from '../hooks/useUserPlan'
import { currentWeekWindowUtc, first30dWindowUtc } from '../lib/subPeriod'
import Footer from '../components/common/Footer'

export default function ChoosePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: plan, isLoading } = useUserPlan()
  const [busy, setBusy] = React.useState<PlanId | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [coupon, setCoupon] = React.useState('') // reserved for Stripe coupons later

  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true'

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
      setBusy('occasional_weekly')
      const { start, end } = currentWeekWindowUtc()
      await upsertLocalSub('occasional_weekly', start, end)
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
      // need profile.created_at to anchor the 30-day window
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

  if (!requireSub) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-mint-green/10 to-cyan-primary/10 flex items-center">
        <div className="max-w-5xl w-full mx-auto p-6">
          <div className="bg-warm-white border border-slate-gray/20 rounded-2xl shadow-sm p-6 md:p-8">
            <h1 className="text-xl font-semibold mb-2">Subscriptions disabled</h1>
            <p className="text-slate-600">
              This environment does not require a plan.{' '}
              <button
                className="underline"
                onClick={() => navigate('/caregiver', { replace: true })}
              >
                Continue
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint-green/10 to-cyan-primary/10 flex">
      <div className="max-w-5xl w-full mx-auto p-6">
        {/* logo in top-right */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Choose your plan</h1>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            title="Back to home"
          >
            <img src="/CareView_logo_1_colored_highres.png" alt="CarerView" className="h-8 w-8" />
            <span className="text-slate-700 hidden sm:inline">Home</span>
          </button>
        </div>

        <p className="text-slate-600 mb-6">
          You can switch plans later. Billing via Stripe will be added soon—no charges yet.
        </p>

        {err && (
          <div className="mb-4 rounded-md border border-peach-blush bg-peach-blush/20 p-3 text-sm text-slate-800">
            {err}
          </div>
        )}

        {/* coupon input (reserved for Stripe later) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Coupon (optional)</label>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            placeholder="Enter coupon code"
          />
          <div className="text-xs text-slate-500 mt-1">Coupons will be applied during checkout when Stripe is connected.</div>
        </div>

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

          {/* Occasional (WEEKLY) */}
          <div className="border rounded-2xl p-5 bg-white">
            <div className="text-lg font-semibold">Occasional Caregiver</div>
            <div className="text-2xl font-bold mt-1">
              $0.50<span className="text-base font-medium text-slate-500">/week</span>
            </div>
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              <li>• 1 observation per week</li>
              <li>• Casual / backup carers</li>
            </ul>
            <button
              onClick={chooseOccasional}
              disabled={busy !== null}
              className="mt-4 w-full rounded-xl py-2 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              {busy === 'occasional_weekly' ? 'Choosing…' : 'Choose Occasional'}
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

        <div className="mt-10">
          <Footer />
        </div>
      </div>
    </div>
  )
}
