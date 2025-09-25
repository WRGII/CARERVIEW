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
import AboutPage from "./pages/AboutPage";

import AdminPage from "./pages/AdminPage";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import AdminDeleteUser from "@/pages/AdminDeleteUser";

import CaregiverPage from "./pages/CaregiverPage";
import NewObservationPage from "./pages/NewObservationPage"; // chooser page (creates row then navigates)
import ObservationEditPage from "./pages/ObservationEditPage"; // ← NEW: edit by :id page

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
              <Route path="/about" element={<AboutPage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route
                path="/privacy-policy"
                element={
                  <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                      <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-gray mb-6">
                          Privacy Policy
                        </h1>
                      </div>
                      <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12">
                        <p className="text-slate-gray text-lg leading-relaxed">
                          Content coming soon. We are committed to protecting your privacy and will provide detailed information about how we collect, use, and protect your personal information.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/data-policy"
                element={
                  <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                      <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-gray mb-6">
                          Data Policy
                        </h1>
                      </div>
                      <div className="bg-warm-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12">
                        <p className="text-slate-gray text-lg leading-relaxed">
                          Content coming soon. We will provide comprehensive information about how we handle, store, and protect your data in accordance with industry best practices and regulatory requirements.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />
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

              {/* New Observation: chooser (creates observation and navigates) */}
              <Route
                path="/caregiver/observations/new"
                element={
                  <CaregiverGuard>
                    <NewObservationPage />
                  </CaregiverGuard>
                }
              />

              {/* Edit existing observation by id */}
              <Route
                path="/caregiver/observations/:id"
                element={
                  <CaregiverGuard>
                    <ObservationEditPage />
                  </CaregiverGuard>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
