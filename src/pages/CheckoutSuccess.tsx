// src/pages/CheckoutSuccess.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserPlan, hasActivePlan } from "../hooks/useUserPlan";
import { supabase } from "../lib/supabaseClient";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const sessionId = search.get("session_id"); // Stripe provides this when success_url uses {CHECKOUT_SESSION_ID}
  const { user } = useAuth();
  const { data: plan } = useUserPlan();

  const [status, setStatus] = React.useState<"waiting" | "ready" | "timeout" | "error">("waiting");
  const [msg, setMsg] = React.useState<string>("Finalizing your subscription…");

  // Helper to re-read the subscription row directly
  const refetchPlan = React.useCallback(async () => {
    if (!user?.id) return null;
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("user_id, plan_id, status, current_period_start, current_period_end, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }, [user?.id]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      // If already active (fast webhook), go immediately.
      if (hasActivePlan(plan)) {
        setStatus("ready");
        navigate("/caregiver", { replace: true });
        return;
      }

      // Otherwise poll for ~15s (10 attempts * 1.5s)
      for (let attempt = 1; attempt <= 10; attempt++) {
        if (cancelled) return;
        try {
          const row = await refetchPlan();
          if (
            row &&
            hasActivePlan({
              user_id: row.user_id,
              plan_id: (row.plan_id ?? null) as any,
              status: (row.status ?? null) as any,
              current_period_start: row.current_period_start as any,
              current_period_end: row.current_period_end as any,
              updated_at: row.updated_at as any,
            })
          ) {
            setStatus("ready");
            navigate("/caregiver", { replace: true });
            return;
          }
        } catch {
          // ignore and keep polling
        }
        if (attempt === 4) setMsg("Almost there… confirming your subscription.");
        await new Promise((r) => setTimeout(r, 1500));
      }

      // Still not active after polling
      setStatus("timeout");
      setMsg("We’re still waiting for Stripe to confirm your subscription.");
    })();

    return () => {
      cancelled = true;
    };
  }, [plan, navigate, refetchPlan]);

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-2">Payment successful</h1>
      <p className="text-slate-600 mb-4">{msg}</p>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-slate-600 space-y-1">
          <div>
            <strong>Status:</strong> {status}
          </div>
          {sessionId && (
            <div>
              <strong>Stripe Session:</strong> {sessionId}
            </div>
          )}
        </div>

        {status === "timeout" && (
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded-lg border bg-slate-900 text-white"
              onClick={() => navigate("/caregiver", { replace: true })}
            >
              Continue to Dashboard
            </button>
            <p className="text-xs text-slate-500 mt-2">
              If you don’t see your plan after a few minutes, refresh the page or contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
