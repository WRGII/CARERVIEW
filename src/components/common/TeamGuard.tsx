import React from "react";
import { Navigate } from "react-router-dom";
import { useUserPlan } from "../../hooks/useUserPlan";

export default function TeamGuard({ children }: { children: React.ReactNode }) {
  const { data: plan, isLoading } = useUserPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (plan?.plan_id !== "family_qtr") return <Navigate to="/caregiver" replace />;
  return <>{children}</>;
}
