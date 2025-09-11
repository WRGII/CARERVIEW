// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { supabase } from "./lib/supabaseClient";

// Pages
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import CaregiverPage from "./pages/CaregiverPage";
import ResetPassword from "./pages/ResetPassword";
import ChoosePlan from "./pages/ChoosePlan";

// Caregiver sub-page
import NewObservationPage from "./components/caregiver/NewObservationPage";

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  if (authLoading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;

  if (profileLoading) return <div className="p-6">Loading…</div>;

  const isAdmin = profile?.role === "admin" && !profile?.disabled;
  if (!isAdmin) return <Navigate to="/caregiver" replace />;

  return children;
}

function CaregiverGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === "true";

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["user-plan-inline", user?.id],
    enabled: requireSub && !authLoading && !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("app")
        .from("user_subscriptions")
        .select("plan_id,status,current_period_end")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error; // allow "no rows"
      return data as { plan_id?: string; status?: string; current_period_end?: string } | null;
    },
    staleTime: 60_000,
  });

  if (authLoading || profileLoading || (requireSub && planLoading)) {
    return <div className="p-6">Preparing your caregiver workspace…</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (profile?.disabled) return <div className="p-6 text-red-600">Account disabled.</div>;

  if (requireSub) {
    const active = plan?.status === "active" && !!plan?.plan_id;
    if (!active) return <Navigate to="/choose-plan" replace />;
  }

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/choose-plan" element={<ChoosePlan />} />

          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            }
          />
          <Route
            path="/caregiver"
            element={
              <CaregiverGuard>
                <CaregiverPage />
              </CaregiverGuard>
            }
          />
          <Route
            path="/caregiver/observations/new"
            element={
              <CaregiverGuard>
                <NewObservationPage />
              </CaregiverGuard>
            }
          />

          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
