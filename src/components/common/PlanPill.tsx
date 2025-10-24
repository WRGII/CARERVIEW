import React from "react";
import { hasActivePlan, useUserPlan } from "../../hooks/useUserPlan";
import type { PlanId } from "../../hooks/useUserPlan";
import { STRIPE_PRODUCTS } from "../../stripe-config";

function getPlanLabel(id: PlanId | null | undefined): string {
  if (!id) return "No plan";

  const product = STRIPE_PRODUCTS.find(p => p.planId === id);
  if (product) {
    return product.name;
  }

  return String(id);
}

function formatShort(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PlanPill() {
  const { data: plan } = useUserPlan();

  if (!hasActivePlan(plan)) return null;

  const label = getPlanLabel(plan?.plan_id);
  const renews = formatShort(plan?.current_period_end);

  const color =
    plan?.plan_id === "free"
      ? "bg-slate-200 text-slate-700"
      : plan?.plan_id === "primary_qtr"
      ? "bg-cyan-600 text-white"
      : plan?.plan_id === "family_qtr"
      ? "bg-slate-700 text-white"
      : "bg-slate-200 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${color}`}
      title={renews ? `Active • renews ${renews}` : "Active"}
      aria-label={`Plan: ${label}${renews ? `, renews ${renews}` : ""}`}
    >
      {label}
    </span>
  );
}
