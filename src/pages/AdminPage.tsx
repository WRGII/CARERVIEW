// src/pages/AdminPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import { AggregateData } from "../components/admin/AggregateData"; // named import (kept)

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading, error } = useAuth();
  const { data: profile } = useProfile(user?.id);

  if (loading) return <div className="p-6">Loading admin dashboard...</div>;
  if (error || !user)
    return (
      <div className="p-6 text-red-600">
        {error || "Authentication required."}
      </div>
    );

  // Prefer display_name → email → fallback label
  const display =
    (profile?.display_name || "").trim() ||
    profile?.email ||
    user.email ||
    "Admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Top bar: identity + logout */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-slate-700">
          <span className="font-semibold">{display}</span>
          <span className="ml-2 inline-block rounded border px-2 py-0.5 text-xs">
            Admin
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
        >
          Log out
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      {/* System-wide aggregates / KPIs */}
      <div className="mt-6">
        <AggregateData />
      </div>

      {/* Add any other existing admin widgets/components below */}
      {/* <OtherAdminWidget /> */}
    </div>
  );
}
