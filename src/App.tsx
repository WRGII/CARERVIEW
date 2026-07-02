import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from './lib/queryClient';
import AppLocaleWrapper from './i18n/AppLocaleWrapper';
import { ToastProvider } from './components/ui/ToastProvider';

import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';

import LandingPage from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import ChoosePlan from './pages/ChoosePlan';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CreateAccountPage from './pages/CreateAccountPage';
import SignInPage from './pages/SignInPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AuthErrorPage from './pages/AuthErrorPage';
import ResetPassword from './pages/ResetPassword';
import AcceptInvite from './pages/AcceptInvite';
import InviteSetupPage from './pages/InviteSetupPage';
import AboutPage from './pages/AboutPage';
import WhyCarerView from './pages/WhyCarerView';
import TutorialPage from './pages/TutorialPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DataPolicyPage from './pages/DataPolicyPage';
import DementiaScalePage from './pages/DementiaScalePage';
import NotFoundPage from './pages/NotFoundPage';

import CaregiverPage from './pages/CaregiverPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import NewObservationPage from './pages/NewObservationPage';
import ObservationEditPage from './pages/ObservationEditPage';
import GuestObservationPage from './pages/GuestObservationPage';
import MemorySchedulePage from './pages/MemorySchedulePage';
import MemoryBookPage from './pages/MemoryBookPage';
import CaregiverResourcesPage from './pages/CaregiverResourcesPage';
import TeamSettings from './pages/TeamSettings';

import CarePlanBuilderPage from './pages/care-hub/CarePlanBuilderPage';
import CarePlanSummaryPage from './pages/care-hub/CarePlanSummaryPage';

import CommunityLandingPage from './pages/CommunityLandingPage';
import CommunityRoomPage from './pages/CommunityRoomPage';
import CommunityNewPostPage from './pages/CommunityNewPostPage';
import CommunityPostPage from './pages/CommunityPostPage';
import CommunityProfileEditPage from './pages/CommunityProfileEditPage';
import CommunityPublicHubPage from './pages/CommunityPublicHubPage';

import NewCarerIndexPage from './pages/new-carer/NewCarerIndexPage';
import BigPicturePage from './pages/new-carer/BigPicturePage';
import RolesPage from './pages/new-carer/RolesPage';
import LivingArrangementsPage from './pages/new-carer/LivingArrangementsPage';
import HealthCoordinationPage from './pages/new-carer/HealthCoordinationPage';
import DocumentsAuthorityPage from './pages/new-carer/DocumentsAuthorityPage';
import SustainabilityPage from './pages/new-carer/SustainabilityPage';
import CarePlanPage from './pages/new-carer/CarePlanPage';
import ReviewPlanPage from './pages/new-carer/ReviewPlanPage';

import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDeleteUser from './pages/AdminDeleteUser';
import AdminTranslationsPage from './pages/AdminTranslationsPage';
import AdminCommunityModerationPage from './pages/AdminCommunityModerationPage';
import ActiveCaregiversPage from './pages/ActiveCaregiversPage';
import CaregiverGuard from './components/common/CaregiverGuard';
import { ErrorBoundary } from './components/util/ErrorBoundary';

import { ActiveTeamProvider } from './context/ActiveTeam';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <AppLocaleWrapper>
          <ToastProvider>
          <ActiveTeamProvider>
          <Routes>
            {/* Public routes with main layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/why" element={<WhyCarerView />} />
              <Route path="/memory-book" element={<MemoryBookPage />} />
              <Route path="/resources" element={<CaregiverResourcesPage />} />
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/data-policy" element={<DataPolicyPage />} />
              <Route path="/dementia-scale" element={<DementiaScalePage />} />
              <Route path="/create-account" element={<CreateAccountPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/join" element={<AcceptInvite />} />
              <Route path="/invite-setup" element={<InviteSetupPage />} />
              <Route path="/choose-plan" element={<ChoosePlan />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />

              {/* Guest observation — public token-based route, no auth required */}
              <Route path="/guest-observation" element={<GuestObservationPage />} />
              <Route path="/caregiver/guest-observation/:token" element={<GuestObservationPage />} />

              {/* All authenticated caregiver + care-hub + new-carer sub-pages share the sidebar */}
              <Route element={<AuthLayout />}>
                <Route path="/caregiver" element={<ErrorBoundary><CaregiverGuard><CaregiverPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/resident" element={<ErrorBoundary><CaregiverGuard><ResidentProfilePage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/observations/new" element={<ErrorBoundary><CaregiverGuard><NewObservationPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/observations/:id/edit" element={<ErrorBoundary><CaregiverGuard><ObservationEditPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/memory-schedule" element={<ErrorBoundary><CaregiverGuard><MemorySchedulePage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/memory-book" element={<ErrorBoundary><CaregiverGuard><MemoryBookPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/resources" element={<ErrorBoundary><CaregiverGuard><CaregiverResourcesPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/caregiver/team-settings" element={<ErrorBoundary><CaregiverGuard><TeamSettings /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/care-hub/care-plan" element={<ErrorBoundary><CaregiverGuard><CarePlanBuilderPage /></CaregiverGuard></ErrorBoundary>} />
                <Route path="/care-hub/care-plan/summary" element={<ErrorBoundary><CaregiverGuard><CarePlanSummaryPage /></CaregiverGuard></ErrorBoundary>} />
                {/* New carer sub-pages show sidebar when accessed by authenticated users */}
                <Route path="/new-carer/big-picture" element={<BigPicturePage />} />
                <Route path="/new-carer/roles" element={<RolesPage />} />
                <Route path="/new-carer/living-arrangements" element={<LivingArrangementsPage />} />
                <Route path="/new-carer/health-coordination" element={<HealthCoordinationPage />} />
                <Route path="/new-carer/documents-authority" element={<DocumentsAuthorityPage />} />
                <Route path="/new-carer/sustainability" element={<SustainabilityPage />} />
                <Route path="/new-carer/care-plan" element={<CarePlanPage />} />
                <Route path="/new-carer/review" element={<ReviewPlanPage />} />
              </Route>

              {/* Community */}
              <Route path="/community" element={<CommunityLandingPage />} />
              <Route path="/community/hub" element={<CommunityPublicHubPage />} />
              <Route path="/community/rooms/:slug" element={<CommunityRoomPage />} />
              <Route path="/community/rooms/:slug/new-post" element={<CommunityNewPostPage />} />
              <Route path="/community/posts/:id" element={<CommunityPostPage />} />
              <Route path="/community/profile/edit" element={<CommunityProfileEditPage />} />

              {/* New carer landing — shows public page for unauthenticated users, auth layout for signed-in users */}
              <Route path="/new-carer" element={<NewCarerIndexPage />} />
            </Route>

            {/* Auth callbacks (no layout) */}
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/auth/error" element={<AuthErrorPage />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/delete-user" element={<AdminDeleteUser />} />
              <Route path="/admin/translations" element={<AdminTranslationsPage />} />
              <Route path="/admin/community-moderation" element={<AdminCommunityModerationPage />} />
              <Route path="/admin/caregivers" element={<ActiveCaregiversPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </ActiveTeamProvider>
          </ToastProvider>
        </AppLocaleWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
