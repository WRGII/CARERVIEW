// src/components/common/AdminGuard.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const { loading: authLoading, user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  if (authLoading || profileLoading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = profile?.role === "admin" && !profile?.disabled;
  if (!isAdmin) {
    return <Navigate to="/caregiver" replace />;
  }

  return children;
}
