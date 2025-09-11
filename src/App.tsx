// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useUserPlan } from "./hooks/useUserPlan";

// Pages
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import CaregiverPage from "./pages/CaregiverPage";
import ResetPassword from "./pages/ResetPassword";
import ChoosePlan from "./pages/ChoosePlan";

// Caregiver sub-page
import NewObservationPage from "./components/caregiver/NewObservationPage";

const queryClient = new QueryClient();

/**
 * IMPORTANT: Never redirect while auth/profile are still loading.
 * Only decide after we know auth + profile states.
 */
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
  // NEW: subscription check
  const { data: plan, isLoading: planLoading } = useUserPlan();
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === "true";

  if (authLoading || profileLoading || (requireSub && planLoading)) {
    return <div className="p-6">Preparing your caregiver workspace…</div>;
  }
  if (!user) return <Navigate to="/" replace />;

  if (profile?.disabled) {
    return <div className="p-6 text-red-600">Account disabled.</div>;
  }

  // Only gate when flag is enabled
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

          {/* NEW: choose-plan route */}
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
          {/* Last resort: if anything falls through, go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
