// src/pages/CheckoutSuccess.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { hasActivePlan, type UserPlan } from "../hooks/useUserPlan";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const { user, loading: authLoading } = useAuth();

  const normalizeISO = (v: unknown): string | null =>
    typeof v === "string" ? v : v ? new Date(v as any).toISOString() : null;

  const {
    data: plan,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["checkout-success-plan", user?.id],
    enabled: !!user?.id && !authLoading,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    queryFn: async (): Promise<UserPlan | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          "user_id, plan_id, status, current_period_start, current_period_end, updated_at"
        )
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"])
        .order("current_period_end", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return data
        ? {
            user_id: data.user_id,
            plan_id: (data.plan_id ?? null) as UserPlan["plan_id"],
            status: (data.status ?? null) as UserPlan["status"],
            current_period_start: normalizeISO(data.current_period_start),
            current_period_end: normalizeISO(data.current_period_end),
            updated_at: normalizeISO(data.updated_at),
          }
        : null;
    },
  });

  const [tookTooLong, setTookTooLong] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setTookTooLong(true), 20000);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (plan && hasActivePlan(plan)) {
      navigate("/caregiver", { replace: true });
    }
  }, [plan, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Finalizing your subscription…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Sign in required</h1>
          <p className="text-slate-600 mb-6">
            Please sign in again so we can confirm your subscription status.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const isActive = plan && hasActivePlan(plan);
  const waiting = isLoading || !isActive;

  const planLabel =
    plan?.plan_id === "free" ? "Free Observer" :
    plan?.plan_id === "primary_qtr" ? "Primary Caregiver" :
    plan?.plan_id === "family_qtr" ? "Family Circle" :
    null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {waiting ? (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
                <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-800 mb-2">Payment received</h1>
              <p className="text-slate-500 mb-6">
                We're activating your plan. This usually takes just a few seconds.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-slate-800 mb-2">You're all set</h1>
              <p className="text-slate-500 mb-6">
                {planLabel ? `Your ${planLabel} plan is now active.` : "Your plan is now active."} Redirecting to your dashboard…
              </p>
            </>
          )}

          {(isError || tookTooLong) && waiting && (
            <div className="mb-6 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-4 text-left">
              Taking longer than expected. You can refresh or head to your dashboard — access will appear once activation completes.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {waiting && (
              <button
                onClick={() => refetch()}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-slate-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Refresh
              </button>
            )}
            <button
              onClick={() => navigate("/caregiver", { replace: true })}
              className="px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
