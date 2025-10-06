// src/components/layout/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan } from "../../hooks/useUserPlan";          // single import
import AccountMenu from "../caregiver/AccountMenu";
import MobileNav from "./MobileNav";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: logoSrc, isLoading: logoLoading } = useBrandingLogo();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: plan } = useUserPlan();                      // hook inside component
  const canUseTeam = plan?.plan_id === "family_qtr";

  const isAuthed = !!user && !profile?.disabled;
  const dashPath = profile?.role === "admin" ? "/admin" : "/caregiver";


  return (
    <>
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Brand */}
            <div className="flex items-center min-w-0 flex-1">
              <Link to="/" aria-label="CarerView home" className="flex items-center hover:opacity-80 transition-opacity min-w-0">
                {logoLoading ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2 sm:mr-3 rounded-md bg-slate-200 animate-pulse flex-shrink-0" />
                ) : (
                  <img
                    src={logoSrc || FALLBACK_LOGO}
                    alt="CarerView Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mr-2 sm:mr-3 rounded-md flex-shrink-0"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <div className="flex items-center min-w-0">
                  <span className="text-lg sm:text-xl font-bold text-slate-800 whitespace-nowrap">CarerView</span>
                  {isAuthed && profile?.role === "caregiver" && (
                    <span className="hidden md:inline text-sm text-slate-600 font-medium ml-3 truncate">
                      Welcome {profile?.display_name || profile?.email || user?.email || 'Caregiver'}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Right: Nav */}
            <div className="flex items-center gap-2 sm:gap-3">
              {authLoading ? (
                <div className="w-[108px] h-9 rounded-lg bg-slate-200 animate-pulse" aria-hidden />
              ) : isAuthed ? (
                <>
                  {/* Dashboard */}
                  <Link
                    to={dashPath}
                    className="inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  >
                    Dashboard
                  </Link>

                  {/* Team (Family plan only) */}
                  {canUseTeam && (
                    <Link
                      to="/team"
                      className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
                    >
                      Team
                    </Link>
                  )}

                  {/* Account */}
                  <AccountMenu />
                </>
              ) : (
                <>
                  {/* Desktop Navigation - Hidden on mobile */}
                  <div className="hidden lg:flex items-center gap-3">
                    <Link
                      to="/about"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      About
                    </Link>
                    <Link
                      to="/why"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Why you need CarerView
                    </Link>
                    <Link
                      to="/pricing"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Pricing
                    </Link>
                    <Link
                      to={{ pathname: "/", hash: "#get-started" }}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>

                  {/* Mobile: Sign In Button + Hamburger */}
                  <div className="flex lg:hidden items-center gap-2">
                    <Link
                      to={{ pathname: "/", hash: "#get-started" }}
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
                    >
                      Sign In
                    </Link>
                    <button
                      onClick={() => setMobileMenuOpen(true)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-primary transition-colors"
                      aria-label="Open menu"
                      aria-expanded={mobileMenuOpen}
                    >
                      <Menu className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {!isAuthed && <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />}
    </>
  );
}
