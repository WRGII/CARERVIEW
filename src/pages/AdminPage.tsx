// src/pages/AdminPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PageContainer } from "../components/common/PageContainer";
import { PageHeader } from "../components/common/PageHeader";
import { AggregateData } from "../components/admin/AggregateData";

export default function AdminPage() {
  const { user, profile, loading, error } = useAuth();

  if (loading) return <div className="p-6">Loading admin dashboard...</div>;
  if (error || !user)
    return (
      <div className="p-6 text-red-600">
        {error || "Authentication required."}
      </div>
    );

  return (
    <PageContainer>
      <PageHeader title="Admin Dashboard" />

      <div className="space-y-6">
        <AggregateData caregiversLink="/admin/caregivers" />

        <div>
        <Link
          to="/admin/caregivers"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-gray/30 px-3 py-2 text-sm text-slate-gray hover:bg-peach-blush/20 transition"
          aria-label="Manage active caregivers"
        >
          Manage caregivers
        </Link>
        </div>
      </div>
    </PageContainer>
  );
}
