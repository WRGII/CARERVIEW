// src/components/layout/Header.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

/** Inline helper: fetch the most recent logo_url from app.site_settings */
function useBrandingLogo() {
  return useQuery({
    queryKey: ["branding", "logo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("app")
        .from("site_settings")
        .select("logo_url")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const raw = data?.logo_url ?? "";
      if (!raw) return "/CareView_logo_1_colored_highres.png";
      if (!/^https?:\/\//i.test(raw)) {
        const base = import.meta.env.BASE_URL ?? "/";
        return `${base}${raw.replace(/^\/+/, "")}`;
      }
      return raw;
    },
    staleTime: 1000 * 60 * 60,    // 1h
    gcTime:   1000 * 60 * 60 * 6, // 6h
    retry: 1,
  });
}

export default function Header() {
  const { data: logoSrc, isLoading } = useBrandingLogo();

  return (
    <header className="bg-warm-white shadow-sm border-b border-slate-gray/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + App name */}
          <Link to="/" aria-label="CarerView home" className="flex items-center">
            {isLoading ? (
              <div className="w-8 h-8 mr-3 rounded-md bg-slate-200 animate-pulse" />
            ) : (
              <img
                src={logoSrc || "/CareView_logo_1_colored_highres.png"}
                alt="CarerView Logo"
                className="w-8 h-8 object-contain mr-3 rounded-md"
                loading="eager"
                decoding="async"
              />
            )}
            <span className="text-xl font-bold text-slate-gray">CarerView</span>
          </Link>

          {/* Right: CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/why-carerview"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-gray/30 px-4 py-2 text-sm font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label="Why you need CarerView"
            >
              Why you need CarerView
            </Link>

            <Link
              to="/#get-started"
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
