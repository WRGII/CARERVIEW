// src/App.tsx
import React, { Suspense, lazy, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import { useUserPlan, hasActivePlan } from "./hooks/useUserPlan";
import { usePrefetchStatic } from "./hooks/usePrefetchStatic";
import { supabase } from "./lib/supabaseClient";

import MainLayout from "./components/layout/MainLayout";
import HashScroll from "./components/util/HashScroll";

// Pages
import LandingPage from "./pages/LandingPage";
import AdminPage from "./pages/AdminPage";
import CaregiverPage from "./pages/CaregiverPage";
import ResetPassword from "./pages/ResetPassword";
import ActiveCaregiversPage from "./pages/ActiveCaregiversPage";
import CreateAccountPage from "./pages/CreateAccountPage"; // 👈 NEW
import WhyCarerView from "./pages/WhyCarerView"; // keep header links working

// Lazy page to improve perceived speed after signup
const ChoosePlan = lazy(() => import("./pages/ChoosePlan"));

// Caregiver sub-page
import NewObservationPage from "./components/caregiver/NewObservationPage";

const queryClient = new QueryClient();

// For pending plan across email-confirm redirects
const PENDING_PLAN_KEY = "cv_pending_plan";

/** Start Stripe checkout for a plan.
 *  Replace the function body with your exact existing Stripe call if needed.
 */
async function startCheckoutForPlan(plan: any) {
  const priceId =
    plan?.stripe_price_id || plan?.stripe_price || plan?.price_id || null;
  if (!priceId) return;

  const success_url = `${window.location.origin}/caregiver`;
  const cancel_url = `${window.location.origin}/create-account`;

  // Try Edge Function
  try {
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      { body: { price_id: priceId, success_url, cancel_url } }
    );
    if (!error && data?.url) {
      localStorage.removeItem(PENDING_PLAN_KEY);
      window.location.href = data.url as string;
      return;
    }
  } catch {
    // fall through to RPC
  }

  // Try Postgres RPC
  const { data: rpc, error: rpcErr } = await supabase.rpc(
    "create_checkout_session",
    { price_id: priceId, success_url, cancel_url }
  );
  if (!rpcErr && rpc?.url) {
    localStorage.removeItem(PENDING_PLAN_KEY);
    window.location.href = rpc.url as string;
  }
}

/** Admin-only guard */
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

/** Caregiver-only guard, with auto-checkout if a pending plan exists post-confirmation */
function CaregiverGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const requireSub = import.meta.env.VITE_REQUIRE_SUBSCRIPTION === "true";
  const { data: plan, isLoading: planLoading } = useUserPlan();

  // Prefetch static data when auth+profile valid
  const prefetchEnabled =
    !authLoading && !!user && !profileLoading && !!profile && !profile.disabled;
  usePrefetchStatic(prefetchEnabled);

  // Only run once per mount
  const startedRef = useRef(false);

  useEffect(() => {
    // After sign-in & profile loaded: if subscription required and none active,
    // try to auto-start checkout from a pending plan stored during sign-up.
    if (
      !startedRef.current &&
      !authLoading &&
      user &&
      !profileLoading &&
      profile &&
      !profile.disabled &&
      requireSub &&
      !planLoading &&
      !hasActivePlan(plan)
    ) {
      const raw = localStorage.getItem(PENDING_PLAN_KEY);
      if (raw) {
        startedRef.current = true;
        try {
          const pending = JSON.parse(raw);
          startCheckoutForPlan(pending);
        } catch {
          localStorage.removeItem(PENDING_PLAN_KEY);
        }
      }
    }
  }, [
    authLoading,
    user,
    profileLoading,
    profile,
    requireSub,
    planLoading,
    plan,
  ]);

  if (authLoading || profileLoading || (requireSub && planLoading)) {
    return <div className="p-6">Preparing your caregiver workspace…</div>;
  }
  if (!user) return <Navigate to="/" replace />;
  if (profile?.disabled)
    return <div className="p-6 text-red-600">Account disabled.</div>;

  // Safety net: if no active subscription and no pending plan, send to legacy chooser
  if (requireSub && !hasActivePlan(plan)) return <Navigate to="/choose-plan" replace />;

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

              {/* NEW: Create account 2-step page */}
              <Route path="/create-account" element={<CreateAccountPage />} />

              {/* Keep as fallback or for legacy flows */}
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

              {/* Active caregivers management */}
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

              {/* Marketing/info page used by Header link */}
              <Route path="/why-carerview" element={<WhyCarerView />} />

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
