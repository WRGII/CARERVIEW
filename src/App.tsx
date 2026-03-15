// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import MainLayout from "./components/layout/MainLayout";
import HashScroll from "./components/util/HashScroll";
import { ErrorBoundary } from "./components/util/ErrorBoundary";

function CommunityErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          We ran into an unexpected problem loading this community page. Please try refreshing, or return to the community hub.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Refresh
          </button>
          <Link
            to="/community"
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-colors"
          >
            Go to Community
          </Link>
        </div>
      </div>
    </div>
  )
}

function AdminErrorFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Admin page failed to load</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Something went wrong loading this admin page. Try refreshing.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}

function SuspenseFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
        </div>
      </div>
    </div>
  )
}

import CaregiverGuard from "./components/common/CaregiverGuard";
import AdminGuard from "./components/common/AdminGuard";
import TeamGuard from "./components/common/TeamGuard";

import LandingPage from "./pages/LandingPage";
import WhyCarerView from "./pages/WhyCarerView";
import CreateAccountPage from "./pages/CreateAccountPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ResetPassword from "./pages/ResetPassword";
import AuthCallbackPage from "./pages/AuthCallbackPage";
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
// CommunityPublicHubPage: unauthenticated preview of the community forum at /community-hub
// CommunityLandingPage:   authenticated members-only hub at /community (requires CommunityGuard)
const CommunityPublicHubPage = lazy(() => import("./pages/CommunityPublicHubPage"));

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
import { HelmetProvider } from "react-helmet-async";

const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

export default function App() {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppLocaleWrapper>
        <ActiveTeamProvider>
          <BrowserRouter>
            <ErrorBoundary>
            <DatabaseStatus />
            <HashScroll />
            <Suspense fallback={<SuspenseFallback />}>
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
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/caregiver-forum" element={<CommunityPublicHubPage />} />
                  <Route path="/community-hub" element={<Navigate to="/caregiver-forum" replace />} />

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
                        <ErrorBoundary fallback={<AdminErrorFallback />}>
                          <AdminTranslationsPage />
                        </ErrorBoundary>
                      </AdminGuard>
                    }
                  />
                  <Route
                    path="/admin/community-moderation"
                    element={
                      <AdminGuard>
                        <ErrorBoundary fallback={<AdminErrorFallback />}>
                          <AdminCommunityModerationPage />
                        </ErrorBoundary>
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
                        <ErrorBoundary fallback={<CommunityErrorFallback />}>
                          <CommunityLandingPage />
                        </ErrorBoundary>
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/rooms/:slug"
                    element={
                      <CommunityGuard>
                        <ErrorBoundary fallback={<CommunityErrorFallback />}>
                          <CommunityRoomPage />
                        </ErrorBoundary>
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/rooms/:slug/new-post"
                    element={
                      <CommunityGuard>
                        <ErrorBoundary fallback={<CommunityErrorFallback />}>
                          <CommunityNewPostPage />
                        </ErrorBoundary>
                      </CommunityGuard>
                    }
                  />
                  <Route
                    path="/community/posts/:postId"
                    element={
                      <CommunityGuard>
                        <ErrorBoundary fallback={<CommunityErrorFallback />}>
                          <CommunityPostPage />
                        </ErrorBoundary>
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
    </HelmetProvider>
  );
}