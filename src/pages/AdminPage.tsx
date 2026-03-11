// src/pages/AdminPage.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { AggregateData } from "../components/admin/AggregateData"; // named import (kept)
import { useLocale } from "../i18n/LocaleContext";
import { useQuery } from "@tanstack/react-query";
import { supabase as sb } from "../lib/supabaseClient";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, profile, loading, error } = useAuth();
  const { t } = useLocale();

  const { data: pendingReportCount } = useQuery<number>({
    queryKey: ['community', 'pending-report-count'],
    queryFn: async () => {
      const { count } = await sb
        .from('community_reports')
        .select('*', { count: 'exact', head: true })
        .eq('report_status', 'pending')
      return count ?? 0
    },
    staleTime: 30_000,
  });

  if (loading) return <div className="p-6">{t('admin.loading')}</div>;
  if (error || !user)
    return (
      <div className="p-6 text-red-600">
        {error || t('common.auth_required')}
      </div>
    );

  // Prefer display_name → email → fallback label
  const display =
    (profile?.display_name || "").trim() ||
    profile?.email ||
    user.email ||
    "Admin";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      // Try router navigation
      navigate("/", { replace: true });
      // Fallback: force hard reload to LandingPage
      setTimeout(() => {
        if (window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }, 50);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Top bar: identity + logout */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-slate-gray">
          <span className="font-semibold">{display}</span>
          <span className="ml-2 inline-block rounded border border-slate-gray/30 px-2 py-0.5 text-xs">
            {t('admin.role_badge')}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded border border-slate-gray/30 px-3 py-1 text-sm hover:bg-peach-blush/20 text-slate-gray"
        >
          {t('nav.sign_out')}
        </button>
      </div>

      <h1 className="text-2xl font-semibold mb-4 text-slate-gray">{t('admin.title')}</h1>

      {/* System-wide aggregates / KPIs */}
      <div className="mt-6">
        {/* NEW: give AggregateData a link target so the "Active Caregivers" card can be clickable */}
        <AggregateData caregiversLink="/admin/caregivers" />
      </div>

      {/* Quick links */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/admin/caregivers"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-gray/30 px-3 py-2 text-sm text-slate-gray hover:bg-peach-blush/20 transition"
          aria-label="Manage active caregivers"
        >
          {t('admin.manage_caregivers')}
        </Link>

        <Link
          to="/admin/community-moderation"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-gray/30 px-3 py-2 text-sm text-slate-gray hover:bg-peach-blush/20 transition"
          aria-label="Community moderation queue"
        >
          <Flag className="w-4 h-4" />
          Community moderation
          {!!pendingReportCount && pendingReportCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {pendingReportCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
