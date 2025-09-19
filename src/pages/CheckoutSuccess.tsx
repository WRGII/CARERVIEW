// src/pages/CheckoutSuccess.tsx
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useUserPlan, hasActivePlan } from '../hooks/useUserPlan'
import { PLANS } from '../config/stripe'

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: plan, isLoading, refetch } = useUserPlan()
  const [isActivating, setIsActivating] = React.useState(true)

  // Poll for subscription activation
  React.useEffect(() => {
    if (hasActivePlan(plan)) {
      setIsActivating(false)
      return
    }

    let tries = 0
    const maxTries = 30 // 1 minute total
    let cancelled = false

    const pollForActivation = async () => {
      if (cancelled) return
      
      const { data: latest } = await refetch()
      if (hasActivePlan(latest)) {
        setIsActivating(false)
        return
      }

      tries += 1
      if (tries < maxTries) {
        setTimeout(pollForActivation, 2000) // Check every 2 seconds
      } else {
        setIsActivating(false) // Stop polling after max tries
      }
    }

    const timer = setTimeout(pollForActivation, 1000) // Start after 1 second
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [plan, refetch])

  const planInfo = plan?.plan_id ? PLANS[plan.plan_id as keyof typeof PLANS] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-mint-green/20 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-gray/20 p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-mint-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-mint-green" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-gray mb-4">
            Payment Successful!
          </h1>

          {/* Status Message */}
          {isActivating ? (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-cyan-primary mb-2">
                <div className="w-4 h-4 border-2 border-cyan-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Activating your subscription...</span>
              </div>
              <p className="text-slate-gray/70 text-sm">
                This usually takes just a few seconds.
              </p>
            </div>
          ) : hasActivePlan(plan) ? (
            <div className="mb-6">
              <p className="text-slate-gray mb-2">
                Your <strong>{planInfo?.label || 'subscription'}</strong> is now active!
              </p>
              <p className="text-slate-gray/70 text-sm">
                You can now start creating observations.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-slate-gray mb-2">
                Your payment was processed successfully.
              </p>
              <p className="text-slate-gray/70 text-sm">
                If your subscription doesn't activate shortly, please contact support.
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => navigate('/caregiver', { replace: true })}
            disabled={isActivating}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-cyan-primary px-6 py-3 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover disabled:opacity-60 transition-all duration-200"
          >
            {isActivating ? (
              'Activating...'
            ) : (
              <>
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Support Link */}
          <p className="mt-4 text-xs text-slate-gray/60">
            Need help? Contact support at{' '}
            <a href="mailto:support@carerview.com" className="text-cyan-primary hover:underline">
              support@carerview.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}