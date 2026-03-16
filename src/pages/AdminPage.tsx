import React from "react";
import { Link } from "react-router-dom";
import { Flag, Users, Globe, Trash2, LayoutDashboard } from "lucide-react";
import { useAdminSession } from "../hooks/useAdminSession";
import { AggregateData } from "../components/admin/AggregateData";
import { useLocale } from "../i18n/LocaleContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export default function AdminPage() {
  const { signOut } = useAdminSession();
  const { t } = useLocale();

  const { data: pendingReportCount } = useQuery<number>({
    queryKey: ["community", "pending-report-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("community_reports")
        .select("*", { count: "exact", head: true })
        .eq("report_status", "pending");
      return count ?? 0;
    },
    staleTime: 30_000,
  });

  const hasPendingReports = !!pendingReportCount && pendingReportCount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-slate-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{t("admin.title")}</h1>
              <p className="text-xs text-slate-500">CareView Administration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {t("nav.sign_out")}
          </button>
        </div>

        <div className="mb-8">
          <AggregateData caregiversLink="/admin/caregivers" />
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Feature Access</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Link
              to="/admin/caregivers"
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <Users className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                  Caregivers
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Caregiver Management</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Invite new caregivers, enable or disable accounts, and manage access. No patient or observation data is visible here.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-600 group-hover:text-cyan-700">
                Manage caregivers
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              to="/admin/community-moderation"
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${hasPendingReports ? "bg-amber-50 border border-amber-100 group-hover:bg-amber-100" : "bg-slate-50 border border-slate-100 group-hover:bg-slate-100"}`}>
                  <Flag className={`w-5 h-5 ${hasPendingReports ? "text-amber-500" : "text-slate-500"}`} />
                </div>
                <div className="flex items-center gap-2">
                  {hasPendingReports && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                      {pendingReportCount}
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                    Community Hub
                  </span>
                </div>
              </div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Community Moderation</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Review reported posts and replies, manage community members, ban users, and maintain a safe environment.
              </p>
              <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all ${hasPendingReports ? "text-amber-600 group-hover:text-amber-700" : "text-slate-500 group-hover:text-slate-700"}`}>
                {hasPendingReports ? `Review ${pendingReportCount} pending report${pendingReportCount === 1 ? "" : "s"}` : "Moderate community"}
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/translations"
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors flex-shrink-0">
                <Globe className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Translation Editor</p>
                <p className="text-xs text-slate-400">Edit UI strings for all locales</p>
              </div>
            </Link>

            <Link
              to="/admin/delete-user"
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-red-100 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-red-50 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Delete User</p>
                <p className="text-xs text-slate-400">Permanently remove an account and all data</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong className="font-semibold">Privacy reminder:</strong> Admin access does not permit reading patient observations, clinical reports, or any care-related content. Aggregate counts are shown for operational purposes only.
          </p>
        </div>

      </div>
    </div>
  );
}
