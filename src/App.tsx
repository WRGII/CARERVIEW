// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useUserPlan, hasActivePlan } from "./hooks/useUserPlan";
import { usePrefetchStatic } from "./hooks/usePrefetchStatic";
import MainLayout from "./components/layout/MainLayout";
import HashScroll from "./components/util/HashScroll";
import WhyPage from "./pages/WhyPage";


// Pages
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import CaregiverPage from "./pages/CaregiverPage";
import ResetPassword from "./pages/ResetPassword";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import CreateAccountPage from "./pages/CreateAccountPage";

// Lazy page
const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

// Caregiver sub-page
import NewObservationPage from "./components/caregiver/NewObservationPage";

const queryClient = new QueryClient();

/** Guards */
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
  const { data: plan, isLoading: planLoading } = useUserPlan();

  const prefetchEnabled =
    !authLoading && !!user && !profileLoading && !!profile && !profile.disabled;
  usePrefetchStatic(prefetchEnabled);

  if (authLoading || profileLoading || (requireSub && planLoading)) {
    return <div className="p-6">Preparing your caregiver workspace…</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (profile?.disabled)
    return <div className="p-6 text-red-600">Account disabled.</div>;
  if (requireSub && !hasActivePlan(plan))
    return <Navigate to="/choose-plan" replace />;

  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HashScroll />
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />

              <Route path="/create-account" element={<CreateAccountPage />} />

              <Route
                path="/choose-plan"
                element={
                  <Suspense fallback={<div className="p-6">Loading plan options…</div>}>
                    <ChoosePlan />
                  </Suspense>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminPage />
                  </AdminGuard>
                }
              />

              <Route
                path="/admin/caregivers"
                element={
                  <AdminGuard>
                    <ActiveCaregiversPage />
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
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
