// src/pages/ChoosePlan.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan } from '../hooks/useUserPlan'
import type { PlanId } from '../hooks/useUserPlan'
import {
  currentMonthWindowUtc,
  currentWeekWindowUtc,
  first30dWindowUtc,
} from '../lib/subPeriod'
import Footer from '../components/common/Footer'

import {
  PLANS,
  RETURN_URLS,
  getStripePriceId,
  type PlanKey,
} from '../config/stripe'

function HeaderLogo() {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .schema('app')
        .from('site_settings')
        .select('logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
      if (!cancelled && !error && data?.[0]?.logo_url) {
        setLogoUrl(data[0].logo_url)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (!logoUrl) return null
  return (
    <a href="/" className="absolute right-6 top-6 inline-flex">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        src={logoUrl}
        className="h-7 w-7 rounded-lg border border-slate-200/70 shadow-sm"
      />
    </a>
  )
}

export default function ChoosePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: plan, isLoading } = useUserPlan()

  const [busy, setBusy] = React.useState<PlanId | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [coupon, setCoupon] = React.useState('')

  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true'

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
    // replace .schema('app').from('user_subscriptions') with:
const { error } = await supabase
  .from('user_subscriptions')
  .upsert({
    user_id: user.id,
    plan_id,
    status: 'active',
    current_period_start: startISO,
    current_period_end: endISO,
  });

  async function startStripeCheckout(which: Extract<PlanKey, 'primary_weekly' | 'occasional_weekly'>) {
    try {
      setErr(null)
      setBusy(which as PlanId)

      if (!user?.id) throw new Error('No user')
      const priceId = getStripePriceId(which)
      if (!priceId) throw new Error(`Missing Stripe price id for ${which}. Set it in .env`)

      // ✅ Correct Edge Function name:
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          plan_id: which,
          promotionCode: coupon.trim() || null,
          success_url: RETURN_URLS.success,
          cancel_url: RETURN_URLS.cancel,
        },
      })

      if (error) throw error
      const url = (data as any)?.url
      if (!url) throw new Error('Stripe checkout URL missing')

      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Failed to start checkout')
      setBusy(null)
    }
  }

  const chooseFree = async () => {
    try {
      setErr(null)
      setBusy('free')
      if (!user?.id) throw new Error('No user')
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
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Subscriptions disabled</h1>
        <p className="text-slate-600">
          This environment does not require a plan.{' '}
          <button className="underline" onClick={() => navigate('/caregiver', { replace: true })}>
            Continue
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="relative max-w-5xl mx-auto p-6">
      <HeaderLogo />
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Choose your plan</h1>
      <p className="text-slate-600 mb-4">
        You can switch plans any time.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="Have a coupon? Enter it here"
          className="flex-1 rounded-xl border px-3 py-2"
        />
        <button
          type="button"
          className="rounded-xl px-4 py-2 border bg-slate-900 text-white"
          onClick={() => {}}
        >
          Apply
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-peach-blush bg-peach-blush/20 p-3 text-sm text-slate-800">
          {err}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-2xl p-5 bg-white">
          <div className="text-lg font-semibold">{PLANS.primary_weekly.name}</div>
          <div className="text-2xl font-bold mt-1">
            $1<span className="text-base font-medium text-slate-500">/week</span>
          </div>
          <ul className="mt-3 text-sm text-slate-600 space-y-1">
            <li>• Up to 7 observations per week</li>
            <li>• Best for daily/primary carers</li>
          </ul>
          <button
            onClick={() => startStripeCheckout('primary_weekly')}
            disabled={busy !== null}
            className="mt-4 w-full rounded-xl py-2 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {busy === 'primary_weekly' ? 'Redirecting…' : 'Choose Primary'}
          </button>
        </div>

        <div className="border rounded-2xl p-5 bg-white">
          <div className="text-lg font-semibold">{PLANS.occasional_weekly.name}</div>
          <div className="text-2xl font-bold mt-1">
            $0.50<span className="text-base font-medium text-slate-500">/week</span>
          </div>
          <ul className="mt-3 text-sm text-slate-600 space-y-1">
            <li>• 1 observation per week</li>
            <li>• Casual / backup carers</li>
          </ul>
          <button
            onClick={() => startStripeCheckout('occasional_weekly')}
            disabled={busy !== null}
            className="mt-4 w-full rounded-xl py-2 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {busy === 'occasional_weekly' ? 'Redirecting…' : 'Choose Occasional'}
          </button>
        </div>

        <div className="border rounded-2xl p-5 bg-white">
          <div className="text-lg font-semibold">{PLANS.free.name}</div>
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
            {busy === 'free' ? 'Setting up…' : 'Choose Free'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
}
