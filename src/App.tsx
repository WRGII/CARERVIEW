// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

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
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import DataPolicyPage from "./pages/DataPolicyPage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminPage from "./pages/AdminPage";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import AdminDeleteUser from "./pages/AdminDeleteUser";
const AdminTranslationsPage = lazy(() => import("./pages/AdminTranslationsPage"));
const AdminCommunityModerationPage = lazy(() => import("./pages/AdminCommunityModerationPage"));

import CaregiverPage from "./pages/CaregiverPage";
import NewObservationPage from "./pages/NewObservationPage";
import ObservationEditPage from "./pages/ObservationEditPage";
import DementiaScalePage from "./pages/DementiaScalePage";

import AcceptInvite from "./pages/AcceptInvite";
import TeamSettings from "./pages/TeamSettings";

import CommunityGuard from "./components/common/CommunityGuard";
const CommunityLandingPage = lazy(() => import("./pages/CommunityLandingPage"));
const CommunityRoomPage = lazy(() => import("./pages/CommunityRoomPage"));
const CommunityPostPage = lazy(() => import("./pages/CommunityPostPage"));
const CommunityNewPostPage = lazy(() => import("./pages/CommunityNewPostPage"));

import { ActiveTeamProvider } from "./context/ActiveTeam";
import { ToastProvider } from "./components/ui/ToastProvider";
import DatabaseStatus from "./components/common/DatabaseStatus";
import AppLocaleWrapper from "./i18n/AppLocaleWrapper";
import { queryClient } from "./lib/queryClient";

const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppLocaleWrapper>
        <ActiveTeamProvider>
          <BrowserRouter>
            <ErrorBoundary>
            <DatabaseStatus />
            <HashScroll />
            <Suspense fallback={<div className="p-6">Loading…</div>}>
              <Routes>
                <Route element={<MainLayout />}>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/why" element={<WhyCarerView />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/data-policy" element={<DataPolicyPage />} />
                  <Route path="/create-account" element={<CreateAccountPage />} />
                  <Route
                    path="/choose-plan"
                    element={<ChoosePlan />}
                  />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
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
                  <Route
                    path="/admin/translations"
                    element={
                      <AdminGuard>
                        <AdminTranslationsPage />
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/community-moderation"
                    element={
                      <AdminGuard>
                        <AdminCommunityModerationPage />
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

                  {/* Community */}
                  <Route
                    path="/community"
                    element={
                      <CommunityGuard>
                        <CommunityLandingPage />
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/rooms/:slug"
                    element={
                      <CommunityGuard>
                        <CommunityRoomPage />
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/rooms/:slug/new-post"
                    element={
                      <CommunityGuard>
                        <CommunityNewPostPage />
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/posts/:postId"
                    element={
                      <CommunityGuard>
                        <CommunityPostPage />
                      </CommunityGuard>
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
                  <Route
                    path="/caregiver/dementia-scale"
                    element={
                      <CaregiverGuard>
                        <DementiaScalePage />
                      </CaregiverGuard>
                    }
                  />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </ActiveTeamProvider>
        </AppLocaleWrapper>
      </ToastProvider>
    </QueryClientProvider>
  );
}