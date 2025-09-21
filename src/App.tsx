import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MainLayout from "./components/layout/MainLayout";
import HashScroll from "./components/util/HashScroll";

// Guards & hooks
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import CaregiverGuard from "./components/common/CaregiverGuard";

// Pages
import LandingPage from "./pages/LandingPage";
import WhyCarerView from "./pages/WhyCarerView";
import CreateAccountPage from "./pages/CreateAccountPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ResetPassword from "./pages/ResetPassword";

import AdminPage from "./pages/AdminPage";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import AdminDeleteUser from "@/pages/AdminDeleteUser";

import CaregiverPage from "./pages/CaregiverPage";
import NewObservationPage from "./pages/NewObservationPage"; // chooser page
import ObservationForm from "./components/caregiver/ObservationForm"; // actual form

// Lazy
const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

const queryClient = new QueryClient();

/** Admin guard (kept local) */
function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  if (authLoading || profileLoading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;

  const isAdmin = profile?.role === "admin" && !profile?.disabled;
  if (!isAdmin) return <Navigate to="/caregiver" replace />;

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
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/why" element={<WhyCarerView />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route
                path="/choose-plan"
                element={
                  <Suspense fallback={<div className="p-6">Loading plan options…</div>}>
                    <ChoosePlan />
                  </Suspense>
                }
              />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin */}
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
                path="/admin/delete-user"
                element={
                  <AdminGuard>
                    <AdminDeleteUser />
                  </AdminGuard>
                }
              />

              {/* Caregiver */}
              <Route
                path="/caregiver"
                element={
                  <CaregiverGuard>
                    <CaregiverPage />
                  </CaregiverGuard>
                }
              />

              {/* New Observation: chooser */}
              <Route
                path="/caregiver/observations/new"
                element={
                  <CaregiverGuard>
                    <NewObservationPage />
                  </CaregiverGuard>
                }
              />

              {/* New Observation: ADL */}
              <Route
                path="/caregiver/observations/new/adl"
                element={
                  <CaregiverGuard>
                    <ObservationForm
                      formType="ADL"
                      onComplete={() => (window.location.href = "/caregiver")}
                    />
                  </CaregiverGuard>
                }
              />

              {/* New Observation: IADL */}
              <Route
                path="/caregiver/observations/new/iadl"
                element={
                  <CaregiverGuard>
                    <ObservationForm
                      formType="IADL"
                      onComplete={() => (window.location.href = "/caregiver")}
                    />
                  </CaregiverGuard>
                }
              />

              {/* NOTE: We'll add /caregiver/observations/new/comprehensive after the form supports it */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
