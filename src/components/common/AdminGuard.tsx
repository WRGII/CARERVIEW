// src/components/common/AdminGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

/** Guard for admin-only routes. Keeps hooks outside of App.tsx to avoid React 310 pitfalls. */
export default function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading, error } = useProfile(user?.id);

  if (authLoading || profileLoading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;

  const isAdmin = profile?.role === "admin" && !profile?.disabled;
  if (!isAdmin || error) return <Navigate to="/caregiver" replace />;

  return children;
}
