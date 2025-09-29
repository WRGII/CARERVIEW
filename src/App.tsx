// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MainLayout from "./components/layout/MainLayout";
import HashScroll from "./components/util/HashScroll";
import { ErrorBoundary } from "./components/util/ErrorBoundary";

import CaregiverGuard from "./components/common/CaregiverGuard";
import AdminGuard from "./components/common/AdminGuard";
import TeamGuard from "./components/common/TeamGuard";

import LandingPage from "./pages/LandingPage";
import WhyCarerView from "./pages/WhyCarerView";
import CreateAccountPage from "./pages/CreateAccountPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ResetPassword from "./pages/ResetPassword";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";

import AdminPage from "./pages/AdminPage";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import AdminDeleteUser from "./pages/AdminDeleteUser";

import CaregiverPage from "./pages/CaregiverPage";
import NewObservationPage from "./pages/NewObservationPage";
import ObservationEditPage from "./pages/ObservationEditPage";

import AcceptInvite from "./pages/AcceptInvite";
import TeamSettings from "./pages/TeamSettings";

import { ActiveTeamProvider } from "./context/ActiveTeam";

const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ActiveTeamProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <HashScroll />
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <Routes>
                <Route element={<MainLayout />}>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/why" element={<WhyCarerView />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
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

                  {/* Invite accept */}
                  <Route path="/join" element={<AcceptInvite />} />

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

                  {/* Team (Family only) */}
                  <Route
                    path="/team"
                    element={
                      <CaregiverGuard>
                        <TeamGuard>
                          <TeamSettings />
                        </TeamGuard>
                      </CaregiverGuard>
                    }
                  />

                  {/* Observations */}
                  <Route
                    path="/caregiver/observations/new"
                    element={
                      <CaregiverGuard>
                        <NewObservationPage />
                      </CaregiverGuard>
                    }
                  />
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
          </ErrorBoundary>
        </BrowserRouter>
      </ActiveTeamProvider>
    </QueryClientProvider>
  );
}
