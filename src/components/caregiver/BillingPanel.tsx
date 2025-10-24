import React from 'react'
import ManageBillingButton from './ManageBillingButton'
import { useUserPlan, hasActivePlan } from '../../hooks/useUserPlan'
import { STRIPE_PRODUCTS } from '../../stripe-config'

function PlanBadge({ planId }: { planId: string | null }) {
  if (!planId) return null

  if (planId === 'free') {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
        Free Observer
      </span>
    )
  }

  const product = STRIPE_PRODUCTS.find(p => p.planId === planId)
  const label = product
    ? `${product.name.replace('CarerView - ', '').replace(' Plan', '')} (${product.planId === 'primary_qtr' ? '30/year' : '100/year'})`
    : planId

  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
      {label}
    </span>
  )
}

export default function BillingPanel() {
  const { data: plan } = useUserPlan()
  const active = hasActivePlan(plan)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">Billing</div>
          <div className="mt-1 text-sm text-slate-600">
            {active ? (
              <span className="inline-flex items-center gap-2">
                <span>Subscription status: </span>
                <span className="inline-flex items-center gap-1 text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </span>
                <PlanBadge planId={plan?.plan_id ?? null} />
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Not active
              </span>
            )}
          </div>
        </div>

        <ManageBillingButton />
      </div>

      {plan?.current_period_end && (
        <div className="mt-2 text-xs text-slate-500">
          Current period ends:&nbsp;
          {new Date(plan.current_period_end).toLocaleString()}
        </div>
      )}
    </section>
  )
}
