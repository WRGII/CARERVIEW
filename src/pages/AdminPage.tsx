import React from "react";
import { Link } from "react-router-dom";
import { Flag, Users } from "lucide-react";
import { AggregateData } from "../components/admin/AggregateData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { getAdminToken } from "../hooks/useAdminSession";

type SubscriberRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  plan_name: string;
  price_cents: number;
  interval: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

async function fetchSubscribers(): Promise<SubscriberRow[]> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated as admin");
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-data`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "list_subscribers" }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load subscribers");
  return (data.data ?? []) as SubscriberRow[];
}

function planLabel(name: string, priceCents: number, interval: string): string {
  const amount = (priceCents / 100).toFixed(2);
  const suffix = interval === "quarter" ? "qtr" : interval === "month" ? "mo" : interval;
  return `${name} — $${amount}/${suffix}`;
}

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd: boolean }) {
  if (cancelAtPeriodEnd && status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
        Cancelling
      </span>
    );
  }
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    past_due: "bg-red-100 text-red-700",
    cancelled: "bg-slate-700 text-slate-300",
    trialing: "bg-cyan-100 text-cyan-700",
  };
  const cls = map[status] ?? "bg-slate-700 text-slate-300";
  const label = status === "past_due" ? "Past due" : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 ${cls}`}>
      {label}
    </span>
  );
}

export default function AdminPage() {
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

  const subscribersQ = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: fetchSubscribers,
    staleTime: 60_000,
  });

  const hasPendingReports = !!pendingReportCount && pendingReportCount > 0;

  return (
    <div className="bg-slate-950 min-h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats band */}
        <AggregateData caregiversLink="/admin/caregivers" />

        {/* Paid Subscribers list */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Paid Subscribers
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {subscribersQ.isLoading ? (
              <div className="px-6 py-8 text-sm text-slate-500">Loading subscribers…</div>
            ) : subscribersQ.error ? (
              <div className="px-6 py-8 text-sm text-red-400">
                {(subscribersQ.error as Error).message}
              </div>
            ) : !subscribersQ.data?.length ? (
              <div className="px-6 py-8 text-sm text-slate-500">No paid subscribers yet.</div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {subscribersQ.data.map((sub) => (
                  <li key={sub.user_id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate">
                        {sub.display_name || "—"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{sub.email || "—"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 whitespace-nowrap">
                        {planLabel(sub.plan_name, sub.price_cents, sub.interval)}
                      </span>
                      <StatusBadge status={sub.status} cancelAtPeriodEnd={sub.cancel_at_period_end} />
                      {sub.current_period_end && (
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          Renews {new Date(sub.current_period_end).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Feature Access */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Feature Access
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Link
              to="/admin/caregivers"
              className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-cyan-900/40 border border-cyan-800/40 flex items-center justify-center group-hover:bg-cyan-900/60 transition-colors">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
                  Caregivers
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-100 mb-1">Caregiver Management</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Invite new caregivers, enable or disable accounts, and manage access.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                Manage caregivers
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              to="/admin/community-moderation"
              className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${hasPendingReports ? "bg-amber-900/40 border border-amber-800/40 group-hover:bg-amber-900/60" : "bg-slate-800 border border-slate-700 group-hover:bg-slate-700"}`}>
                  <Flag className={`w-5 h-5 ${hasPendingReports ? "text-amber-400" : "text-slate-400"}`} />
                </div>
                <div className="flex items-center gap-2">
                  {hasPendingReports && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                      {pendingReportCount}
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
                    Community Hub
                  </span>
                </div>
              </div>
              <h2 className="text-base font-bold text-slate-100 mb-1">Community Moderation</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Review reported posts, manage community members, ban users, and maintain a safe environment.
              </p>
              <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all ${hasPendingReports ? "text-amber-400 group-hover:text-amber-300" : "text-slate-400 group-hover:text-slate-200"}`}>
                {hasPendingReports ? `Review ${pendingReportCount} pending report${pendingReportCount === 1 ? "" : "s"}` : "Moderate community"}
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Tools */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Tools</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/admin/translations"
              className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-slate-600 hover:bg-slate-800/60 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Translation Editor</p>
                <p className="text-xs text-slate-500">Edit UI strings for all locales</p>
              </div>
            </Link>

            <Link
              to="/admin/delete-user"
              className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-red-900/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-red-950/60 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Delete User</p>
                <p className="text-xs text-slate-500">Permanently remove an account and all data</p>
              </div>
            </Link>
          </div>
        </section>

        <p className="text-xs text-slate-600 pb-4">
          Privacy reminder: Admin access does not permit reading resident observations, clinical reports, or any care-related content.
        </p>

      </div>
    </div>
  );
}
