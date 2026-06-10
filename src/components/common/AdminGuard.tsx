import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminSession } from "../../hooks/useAdminSession";

export default function AdminGuard({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAdminSession();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
