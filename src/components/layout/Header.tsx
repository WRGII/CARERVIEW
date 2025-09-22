import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../hooks/useAuth";
import { useUserPlan } from "../../hooks/useUserPlan";
import PlanPill from "../common/PlanPill";
import AccountMenu from "../caregiver/AccountMenu";

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

  const isAuthed = !!user && !profile?.disabled;
  const dashPath = profile?.role === "admin" ? "/admin" : "/caregiver";

  // Add emergency sign out function for stuck states
  const emergencySignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Clear any local storage that might be causing issues
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
      window.location.reload()
    } catch (error) {
      console.error('Emergency sign out error:', error)
      window.location.reload()
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo & Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              aria-label="CarerView home" 
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              {logoLoading ? (
                <div className="w-8 h-8 mr-3 rounded-md bg-slate-200 animate-pulse" />
              ) : (
                <img
                  src={logoSrc || FALLBACK_LOGO}
                  alt="CarerView Logo"
                  className="w-8 h-8 object-contain mr-3 rounded-md"
                  loading="eager"
                  decoding="async"
                />
              )}
              <div className="flex items-center">
                <span className="text-xl font-bold text-slate-800 mr-3">CarerView</span>
                {/* Show plan pill for authenticated caregivers */}
                {isAuthed && profile?.role === "caregiver" && <PlanPill />}
              </div>
            </Link>
          </div>

          {/* Right: Navigation */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-[108px] h-9 rounded-lg bg-slate-200 animate-pulse"
                  aria-hidden
                />
                {/* Emergency reset button if loading takes too long */}
                <button
                  onClick={emergencySignOut}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                  title="Click if the page seems stuck loading"
                >
                  Reset
                </button>
              </div>
            ) : isAuthed ? (
              <>
                {/* Dashboard Button */}
                <Link
                  to={dashPath}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  aria-label="Go to Dashboard"
                >
                  Dashboard
                </Link>
                
                {/* Account Menu with Sign Out */}
                <AccountMenu />
              </>
            ) : (
              <>
                {/* Why you need CarerView - only for unauthenticated users */}
                <Link
                  to="/why"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all duration-200"
                  aria-label="Why you need CarerView"
                >
                  Why you need CarerView
                </Link>
                
                {/* Sign In */}
                <Link
                  to={{ pathname: "/", hash: "#get-started" }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                  aria-label="Sign In"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}