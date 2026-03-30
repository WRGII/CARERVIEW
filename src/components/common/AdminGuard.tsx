import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminSession } from "../../hooks/useAdminSession";
import { useAuth } from "../../hooks/useAuth";

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAdminSession();
  const { profile, loading } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!loading && profile && profile.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
