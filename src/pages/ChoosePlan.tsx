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
import { Footer } from '../components/common/Footer' // keep if you created this component

function HeaderLogo() {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    ;(async () => {
      // IMPORTANT: target the app schema explicitly
      const { data, error } = await supabase
        .schema('app')
        .from('site_settings')
        .select('logo_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!active) return

      if (error) {
        // Silent fail → use fallback asset if present
        setLogoUrl('/CareView_logo_1_colored_highres.png')
        return
      }
      setLogoUrl(data?.logo_url || '/CareView_logo_1_colored_highres.png')
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <a href="/" className="inline-flex items-center justify-center w-8 h-8 rounded">
      {/* simple circle w/ image; use your preferred styling */}
      <img
        src={logoUrl || '/CareView_logo_1_colored_highres.png'}
        alt="CarerView"
        className="w-8 h-8 object-contain"
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
    const { error } = await supabase
      .schema('app') // schema explicit
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
      // (coupon is not applied yet; we’ll wire Stripe later)
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="w-full border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">Choose your plan</h1>
          <HeaderLogo />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">
        <p className="text-slate-600 mb-4">
          You can switch plans later. Billing via Stripe will be added soon—no charges yet.
        </p>

        {/* Coupon input (placeholder only) */}
        <div className="flex items-center gap-2 mb-6">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Have a coupon? Enter it here"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 bg-white"
          />
          <button
            type="button"
            className="rounded-lg px-4 py-2 bg-slate-800 text-white disabled:opacity-50"
            disabled={!coupon.trim()}
            onClick={() => {/* no-op for now; Stripe later */}}
          >
            Apply
          </button>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
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
