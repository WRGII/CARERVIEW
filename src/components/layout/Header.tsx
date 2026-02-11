// src/components/layout/Header.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan } from "../../hooks/useUserPlan";
import AccountMenu from "../caregiver/AccountMenu";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const FALLBACK_LOGO = "/CareView_logo_1_colored_highres.png";

function useBrandingLogo() {
  return useQuery({
    queryKey: ["branding", "logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("app")
        .from("site_settings")
        .select("logo_url, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return FALLBACK_LOGO;

      const raw = data?.logo_url ?? "";
      if (!raw) return FALLBACK_LOGO;
      if (!/^https?:\/\//i.test(raw)) {
        const base = import.meta.env.BASE_URL ?? "/";
        return `${base}${raw.replace(/^\/+/, "")}`;
      }
      return raw;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}

export default function Header() {
  const { data: logoSrc, isLoading: logoLoading } = useBrandingLogo();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: plan } = useUserPlan();
  const canUseTeam = plan?.plan_id === "family_qtr";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthed = !!user && !profile?.disabled;
  const dashPath = profile?.role === "admin" ? "/admin" : "/caregiver";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link to="/" aria-label="CarerView home" className="flex items-center hover:opacity-80 transition-opacity">
              {logoLoading ? (
                <div className="w-10 h-10 md:w-12 md:h-12 mr-3 rounded-md bg-slate-200 animate-pulse" />
              ) : (
                <img
                  src={logoSrc || FALLBACK_LOGO}
                  alt="CarerView Logo"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain mr-3 rounded-md"
                  loading="eager"
                  decoding="async"
                />
              )}
              <div className="flex items-center">
                <span className="text-xl font-bold text-slate-800 mr-3">CarerView</span>
                {isAuthed && profile?.role === "caregiver" && (
                  <span className="text-sm text-slate-600 font-medium">
                    Welcome {profile?.display_name || profile?.email || user?.email || 'Caregiver'}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Right: Nav */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-[108px] h-9 rounded-lg bg-slate-200 animate-pulse" aria-hidden />
            ) : isAuthed ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to={dashPath}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 min-h-[44px]"
                  >
                    Dashboard
                  </Link>

                  {canUseTeam && (
                    <Link
                      to="/team"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 min-h-[44px]"
                    >
                      Family Circle
                    </Link>
                  )}

                  <AccountMenu />
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 min-h-[44px] min-w-[44px]"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Desktop Navigation - hidden on mobile */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/about"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
                  >
                    About
                  </Link>
                  <Link
                    to="/why"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
                  >
                    Why your family needs CarerView
                  </Link>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg"
                  >
                    Pricing
                  </Link>
                  <Link
                    to={{ pathname: "/", hash: "#get-started" }}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg hover:bg-cyan-700"
                  >
                    Sign In
                  </Link>
                </div>

                {/* Mobile Menu Button - visible only on mobile */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          <div className="fixed top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 md:hidden">
            <nav className="px-4 py-3 space-y-1">
              {isAuthed ? (
                <>
                  <Link
                    to={dashPath}
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Dashboard
                  </Link>
                  {canUseTeam && (
                    <Link
                      to="/team"
                      onClick={closeMobileMenu}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                    >
                      Family Circle
                    </Link>
                  )}
                  <Link
                    to="/choose-plan?manage=true"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Manage Billing
                  </Link>
                  <button
                    onClick={async () => {
                      closeMobileMenu();
                      await supabase.auth.signOut();
                      window.location.assign("/");
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    About
                  </Link>
                  <Link
                    to="/why"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Why your family needs CarerView
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={closeMobileMenu}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]"
                  >
                    Pricing
                  </Link>
                  <Link
                    to={{ pathname: "/", hash: "#get-started" }}
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors mt-2 min-h-[44px]"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
