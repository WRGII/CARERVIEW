// src/pages/ChoosePlan.tsx
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan'
import { usePlans } from '../hooks/usePlans'
import {
  PLANS,
  RETURN_URLS,
  getStripePriceId,
  formatPrice,
  type PlanKey,
} from '../config/stripe'

function HeaderLogo() {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .schema('app')
          .from('site_settings')
          .select('logo_url')
          .order('updated_at', { ascending: false })
          .limit(1)
        if (!cancelled && !error && data?.[0]?.logo_url) {
          setLogoUrl(data[0].logo_url)
        }
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (!logoUrl) return null
  return (
    <a href="/" className="absolute right-6 top-6 inline-flex">
      <img
        src={logoUrl}
        className="h-7 w-7 rounded-lg border border-slate-200/70 shadow-sm"
        alt="CarerView Logo"
      />
    </a>
  )
}

export default function ChoosePlan() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: plan, isLoading: planLoading, refetch } = useUserPlan()
  const { data: dbPlans, isLoading: plansLoading } = usePlans()
  const [searchParams] = useSearchParams()

  const statusParam = searchParams.get('status') // "success" after checkout
  const canceledParam = searchParams.get('canceled')
  const manageParam = searchParams.get('manage') === 'true' // <-- new

  const [busy, setBusy] = React.useState<PlanKey | 'portal' | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [coupon, setCoupon] = React.useState('')

  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === 'true'

  /** -------- OPEN STRIPE CUSTOMER PORTAL (for Manage Billing) -------- */
  const openPortal = React.useCallback(async () => {
    if (!user?.id) return
    try {
      setErr(null)
      setBusy('portal')

      // You can name this function 'stripe-portal' or 'billing-portal' — keep
      // it consistent with your deployed Function name.
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: {
          // where Stripe should send the user after they exit the portal:
          return_url: RETURN_URLS.portalReturn ?? window.location.origin + '/caregiver',
        },
      })

      if (error) throw new Error(error.message || 'Failed to open billing portal')
      const url = (data as any)?.url
      if (!url) throw new Error('Stripe portal URL missing')

      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Failed to open billing portal')
      setBusy(null)
    }
  }, [user?.id])

  /**
   * If the user came explicitly to manage billing (?manage=true),
   * DO NOT auto-redirect them away even if they have an active plan.
   * Instead, open the Stripe Customer Portal immediately.
   */
  React.useEffect(() => {
    if (!manageParam) return
    // Wait until we know auth/plan is loaded enough to call the function.
    if (planLoading) return
    // Open portal once on mount for this mode.
    openPortal()
  }, [manageParam, planLoading, openPortal])

  /** If subscriptions are required and the user already has a plan,
   * we normally redirect them to /caregiver — but *not* when managing billing.
   */
  React.useEffect(() => {
    if (!requireSub) return
    if (manageParam) return // <-- keep them here to open portal
    if (!planLoading && hasActivePlan(plan)) {
      navigate('/caregiver', { replace: true })
    }
  }, [requireSub, manageParam, planLoading, plan, navigate])

  /** After returning from Stripe Checkout (?status=success), poll until webhook updates the plan. */
  React.useEffect(() => {
    if (statusParam !== 'success') return
    let tries = 0
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      const { data: latest } = await refetch()
      if (hasActivePlan(latest)) {
        navigate('/caregiver', { replace: true })
        return
      }
      tries += 1
      if (tries < 30) {
        setTimeout(tick, 2000) // try again in 2s (≈1 minute total)
      } else {
        setErr(
          "Payment succeeded. We're still finalizing your subscription—this can take a moment. If this persists, refresh the page."
        )
      }
    }

    setErr(null)
    tick()
    return () => { cancelled = true }
  }, [statusParam, refetch, navigate])

  async function startStripeCheckout(planKey: PlanKey) {
    try {
      setErr(null)
      setBusy(planKey)

      if (!user?.id) throw new Error('No user')
      const priceId = getStripePriceId(planKey)
      if (!priceId) throw new Error(`Missing Stripe price id for ${planKey}`)

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          plan_id: planKey,
          promotionCode: coupon.trim() || null,
          success_url: RETURN_URLS.success,
          cancel_url: RETURN_URLS.cancel,
        },
      })

      if (error) throw new Error(error.message || 'Failed to start checkout')

      const url = (data as any)?.url
      if (!url) throw new Error('Stripe checkout URL missing')

      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Failed to start checkout')
      setBusy(null)
    }
  }

  /** --------- Simple loading UIs --------- */
  if (manageParam) {
    // Managing billing: show a tiny "opening portal" status while we invoke the function
    return (
      <div className="p-6 max-w-xl mx-auto">
        <HeaderLogo />
        <h1 className="text-xl font-semibold mb-2">Opening Billing Portal…</h1>
        <p className="text-slate-600">
          One moment while we connect you to Stripe to manage your subscription.
        </p>
        {err && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}
        <div className="mt-6">
          <button
            className="rounded-xl px-4 py-2 border bg-slate-900 text-white disabled:opacity-60"
            disabled={busy === 'portal'}
            onClick={openPortal}
          >
            {busy === 'portal' ? 'Connecting…' : 'Try Again'}
          </button>
          <button
            className="ml-3 underline text-slate-700"
            onClick={() => navigate('/caregiver')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!requireSub) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Subscriptions disabled</h1>
        <p className="text-slate-600">
          This environment does not require a plan{' '}
          <button className="underline" onClick={() => navigate('/caregiver', { replace: true })}>
            Continue
          </button>
        </p>
      </div>
    )
  }

  if (plansLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Loading plans…</h1>
      </div>
    )
  }

  /** --------- Default: show plan cards --------- */
  return (
    <div className="relative max-w-5xl mx-auto p-6">
      <HeaderLogo />
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Choose your plan</h1>
      <p className="text-slate-600 mb-4">You can switch plans any time.</p>

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

      {statusParam === 'success' && !hasActivePlan(plan) && !err && (
        <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
          Payment approved. Activating your subscription…
        </div>
      )}

      {canceledParam === '1' && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          Checkout was canceled. You can try again anytime.
        </div>
      )}

      {err && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        {/* Occasional Caregiver */}
        <div className="border rounded-2xl p-6 bg-white">
          <div className="text-lg font-semibold">{PLANS.occasional_weekly.label}</div>
          <div className="text-2xl font-bold mt-2">
            {formatPrice(PLANS.occasional_weekly.price)}
            <span className="text-base font-medium text-slate-500">/week</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {PLANS.occasional_weekly.description}
          </p>
          <ul className="mt-4 text-sm text-slate-600 space-y-1">
            <li>• 1 observation per week</li>
            <li>• Perfect for occasional caregivers</li>
            <li>• Full access to all features</li>
          </ul>
          <button
            onClick={() => startStripeCheckout('occasional_weekly')}
            disabled={busy !== null}
            className="mt-6 w-full rounded-xl py-3 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 font-semibold"
          >
            {busy === 'occasional_weekly' ? 'Redirecting…' : 'Choose Occasional'}
          </button>
        </div>

        {/* Primary Caregiver */}
        <div className="border rounded-2xl p-6 bg-white relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              Most Popular
            </span>
          </div>
          <div className="text-lg font-semibold">{PLANS.primary_weekly.label}</div>
          <div className="text-2xl font-bold mt-2">
            {formatPrice(PLANS.primary_weekly.price)}
            <span className="text-base font-medium text-slate-500">/week</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {PLANS.primary_weekly.description}
          </p>
          <ul className="mt-4 text-sm text-slate-600 space-y-1">
            <li>• Up to 7 observations per week</li>
            <li>• Best for primary caregivers</li>
            <li>• Full access to all features</li>
            <li>• Export capabilities</li>
          </ul>
          <button
            onClick={() => startStripeCheckout('primary_weekly')}
            disabled={busy !== null}
            className="mt-6 w-full rounded-xl py-3 border bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 font-semibold"
          >
            {busy === 'primary_weekly' ? 'Redirecting…' : 'Choose Primary'}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          All plans include full access to CarerView features. Cancel anytime.
        </p>
      </div>

    </div>
  )
}