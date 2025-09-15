import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

const FALLBACK_LOGO = "/CareView_logo_1_colored_highres.png";

/** Fetch the most recent logo_url from app.site_settings.
 *  Works even if public is the default schema, because we force schema('app').
 *  If the table isn't found or RLS denies, we return a safe fallback path.
 */
function useBrandingLogo() {
  return useQuery({
    queryKey: ["branding", "logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("app") // ✅ force the app schema
        .from("site_settings")
        .select("logo_url, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("[Header] site_settings lookup failed → using fallback logo", error);
        return FALLBACK_LOGO;
      }

      const raw = data?.logo_url ?? "";
      if (!raw) return FALLBACK_LOGO;

      // If not absolute, treat as app-relative (Netlify-friendly)
      if (!/^https?:\/\//i.test(raw)) {
        const base = import.meta.env.BASE_URL ?? "/";
        return `${base}${raw.replace(/^\/+/, "")}`;
      }
      return raw;
    },
    staleTime: 1000 * 60 * 60, // 1h
    gcTime: 1000 * 60 * 60 * 6, // 6h
    retry: 1,
  });
}

export default function Header() {
  const { data: logoSrc, isLoading } = useBrandingLogo();

  return (
    <header className="bg-warm-white shadow-sm border-b border-slate-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + App name -> always links to LandingPage "/" */}
          <Link to="/" aria-label="CarerView home" className="flex items-center">
            {isLoading ? (
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
            <span className="text-xl font-bold text-slate-gray">CarerView</span>
          </Link>

          {/* Right: nav buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/why"  // ✅ dedicated page
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label="Why you need CarerView"
            >
              Why you need CarerView
            </Link>

            {/* Use pathname+hash so React Router updates the hash without a full reload */}
            <Link
              to={{ pathname: "/", hash: "#get-started" }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label="Go to Sign In"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
