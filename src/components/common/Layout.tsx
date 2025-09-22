import React from "react";
import Header from "../layout/Header";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  title?: string;
  subtitle?: React.ReactNode;
  /** Put buttons on the right side of the page header (optional) */
  headerRight?: React.ReactNode;
  /** Hide the legacy Sign Out action rendered by Layout (we’ll use AccountMenu instead). */
  hideSignOut?: boolean;
  /** When provided, Layout can still show who’s logged in, etc. */
  user?: { email?: string | null; profile?: { display_name?: string | null } | null } | null;
  children: React.ReactNode;
};

export function Layout({
  title,
  subtitle,
  headerRight,
  hideSignOut = false,
  user,
  children,
}: Props) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/");
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {(title || subtitle || !hideSignOut || headerRight) && (
          <div className="flex items-start justify-between">
            <div>
              {title && <h1 className="text-2xl font-bold text-slate-gray">{title}</h1>}
              {subtitle && <div className="mt-1 text-slate-gray/70">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-3">
              {headerRight}
              {!hideSignOut && (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default Layout;
