import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, LogOut, ChevronLeft } from "lucide-react";
import { useAdminSession } from "../../hooks/useAdminSession";

export default function AdminLayout() {
  const { signOut } = useAdminSession();

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-200 tracking-tight">CareView Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
