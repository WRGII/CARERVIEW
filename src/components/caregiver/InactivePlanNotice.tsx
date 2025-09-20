import React from "react";
import { Link } from "react-router-dom";
import { useUserPlan, hasActivePlan } from "../../hooks/useUserPlan";

type Props = { className?: string };

export default function InactivePlanNotice({ className = "" }: Props) {
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === "true";
  const { data: plan, isLoading, error } = useUserPlan();

  // If subs aren’t required for this env, don’t show anything
  if (!requireSub) return null;
  // Don’t flash during loading
  if (isLoading) return null;
  // If they’re active, no banner
  if (hasActivePlan(plan)) return null;

  // Optional detail line for debugging/user clarity
  const detail =
    plan?.status
      ? `Status: ${plan.status}`
      : error
      ? "Could not read your subscription status."
      : "No active subscription found.";

  return (
    <div
      className={
        "rounded-xl border border-peach-blush/60 bg-peach-blush/15 p-4 " +
        className
      }
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-800">
            Your subscription isn’t active yet.
          </div>
          <div className="text-slate-700 text-sm">{detail}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/choose-plan"
            className="inline-flex items-center rounded-lg border bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Choose a plan
          </Link>
          <Link
            to="/checkout-success"
            className="inline-flex items-center rounded-lg border px-4 py-2 text-slate-800 hover:bg-white"
            title="If you just paid, this page will finalize once webhooks arrive."
          >
            I just paid
          </Link>
        </div>
      </div>
    </div>
  );
}
