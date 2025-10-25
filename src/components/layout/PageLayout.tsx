/**
 * PageLayout
 *
 * Inner layout component for individual page content.
 * Use this component within pages that need:
 * - A centered content container with max-width
 * - Page title and subtitle
 * - Optional header actions (buttons, etc.)
 * - Optional sign-out functionality
 *
 * This is used INSIDE pages, while MainLayout provides the outer
 * site-wide structure (Header/Footer).
 */
import React from "react";
import { supabase } from "../../lib/supabaseClient";

type Props = {
  title?: string;
  subtitle?: React.ReactNode;
  /** Put buttons on the right side of the page header (optional) */
  headerRight?: React.ReactNode;
  /** Hide the legacy Sign Out action rendered by PageLayout (we'll use AccountMenu instead). */
  hideSignOut?: boolean;
  /** When provided, PageLayout can still show who's logged in, etc. */
  user?: { email?: string | null; profile?: { display_name?: string | null } | null } | null;
  children: React.ReactNode;
};

export function PageLayout({
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {(title || subtitle || !hideSignOut || headerRight) && (
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              {title && <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>}
              {subtitle && <div className="text-slate-600">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {headerRight}
              {!hideSignOut && (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all"
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

export default PageLayout;
