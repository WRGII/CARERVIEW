// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";

// ✅ LandingPage is a DEFAULT export — import without braces
import LandingPage from "./pages/LandingPage";

// These are default exports
import AdminPage from "./pages/AdminPage";
import CaregiverPage from "./pages/CaregiverPage";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!profile) return <div className="p-6 text-red-600">Profile not found. Please contact support.</div>;

  const isAdmin = profile.role === "admin" && !profile.disabled;
  if (!isAdmin) return <Navigate to="/caregiver" replace />;

  return children;
}

function CaregiverGuard({ children }: { children: JSX.Element }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <div className="p-6">Preparing your caregiver workspace…</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!profile) return <div className="p-6 text-red-600">Profile not found. Please contact support.</div>;

  if (profile.disabled) return <div className="p-6 text-red-600">Account disabled.</div>;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
