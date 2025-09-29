import { Navigate } from "react-router-dom";
import { useUserPlan } from "../../hooks/useUserPlan";

export default function TeamGuard({ children }: { children: React.ReactNode }) {
  const { data: plan, isLoading } = useUserPlan();
  if (isLoading) return null;                 // or a small spinner
  if (plan?.plan_id !== "family_qtr") return <Navigate to="/caregiver" replace />;
  return <>{children}</>;
}
