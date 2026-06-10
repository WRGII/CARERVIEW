import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, LogOut, ChevronLeft, Clock } from "lucide-react";
import { useAdminSession, getAdminToken } from "../../hooks/useAdminSession";

const WARN_SECONDS = 15 * 60; // show warning when < 15 min remain

function getTokenSecondsRemaining(): number | null {
  try {
    const token = getAdminToken();
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return null;
    return payload.exp - Math.floor(Date.now() / 1000);
  } catch {
    return null;
  }
}

function formatMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useTokenExpiry(onExpired: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(getTokenSecondsRemaining);

  useEffect(() => {
    const tick = () => {
      const remaining = getTokenSecondsRemaining();
      if (remaining === null || remaining <= 0) {
        setSecondsLeft(null);
        onExpired();
        return;
      }
      setSecondsLeft(remaining);
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onExpired]);

  return secondsLeft;
}

export default function AdminLayout() {
  const { signOut } = useAdminSession();
  const secondsLeft = useTokenExpiry(signOut);
  const showWarning = secondsLeft !== null && secondsLeft <= WARN_SECONDS;

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-200 tracking-tight">CareView Admin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {showWarning && secondsLeft !== null && (
              <div className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-400 border border-amber-500/30">
                <Clock className="w-3 h-3" />
                Session expires in {formatMMSS(secondsLeft)}
              </div>
            )}
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
