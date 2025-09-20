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

  // Normalize to the UserPlan shape our hasActivePlan() expects
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
    refetchInterval: 2000, // poll every 2s until webhook writes the row
    refetchIntervalInBackground: true,
    queryFn: async (): Promise<UserPlan | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(
          "user_id, plan_id, status, current_period_start, current_period_end, updated_at"
        )
        .eq("user_id", user.id)
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

  // After ~20s of polling, show extra guidance
  const [tookTooLong, setTookTooLong] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setTookTooLong(true), 20000);
    return () => clearTimeout(t);
  }, []);

  // As soon as plan is usable, go to the dashboard
  React.useEffect(() => {
    if (plan && hasActivePlan(plan)) {
      navigate("/caregiver", { replace: true });
    }
  }, [plan, navigate]);

  if (authLoading) {
    return <div className="p-6">Finalizing your subscription…</div>;
  }
  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Sign in required</h1>
        <p className="text-slate-600">
          Please sign in again so we can confirm your subscription status.
        </p>
      </div>
    );
  }

  const waiting =
    isLoading || !plan || !plan.status || !plan.current_period_end || !hasActivePlan(plan);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Payment successful</h1>
      <p className="text-slate-600 mb-4">
        {waiting
          ? "We’re confirming your payment and activating your plan. This usually takes a few seconds."
          : "Your plan is active — redirecting to your dashboard…"}
      </p>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-600 space-y-1">
          <div>
            <strong>Status:</strong>{" "}
            {isError ? "error" : waiting ? "waiting" : "ready"}
          </div>
          {sessionId && (
            <div>
              <strong>Stripe Session:</strong> {sessionId}
            </div>
          )}
          <div className="pt-2">
            <div>• plan_id: <code>{plan?.plan_id ?? "—"}</code></div>
            <div>• status: <code>{plan?.status ?? "—"}</code></div>
            <div>• current_period_start: <code>{plan?.current_period_start ?? "—"}</code></div>
            <div>• current_period_end: <code>{plan?.current_period_end ?? "—"}</code></div>
          </div>
        </div>

        {(isError || tookTooLong) && (
          <div className="mt-4 text-sm text-slate-700">
            Still waiting on the webhook to update your account. You can:
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Click “Refresh now” below</li>
              <li>Return to your dashboard; access will appear when activation completes</li>
            </ul>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg border"
            onClick={() => refetch()}
          >
            Refresh now
          </button>
          <button
            className="px-3 py-2 rounded-lg border bg-slate-900 text-white"
            onClick={() => navigate("/caregiver", { replace: true })}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
