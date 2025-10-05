import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export function Footer() {
  const [logoUrl, setLogoUrl] = React.useState<string>(
    "/CareView_logo_1_colored_highres.png"
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .schema("app")
          .from("site_settings")
          .select("logo_url")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!mounted) return;
        if (data?.logo_url) setLogoUrl(data.logo_url);
      } catch {
        // keep fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & About Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img
                src={logoUrl}
                alt="CarerView"
                className="w-8 h-8 object-contain opacity-80"
              />
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Built with caregivers & clinicians in mind. Categories reflect
              widely used ADL & IADL frameworks and occupational-therapy best
              practices, translated into everyday language families can use
              together.
            </p>
            <div>
              <Link
                to="/about"
                className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
              >
                About CarerView
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-800 text-base mb-4">
              Contact
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div>
                <span className="block text-slate-700 font-medium mb-1">
                  Suggestions? Questions?
                </span>
                {/* Fixed label+mailto mismatch; change to your preferred address */}
                <a
                  href="mailto:lina@carerview.com"
                  className="text-cyan-primary hover:text-cyan-hover underline"
                >
                  lina@carerview.com
                </a>
              </div>
              <div className="mt-3">
                <span className="block text-slate-700 font-medium mb-1">
                  Locations:
                </span>
                <div className="space-y-1">
                  <div>Christchurch, New Zealand</div>
                  <div>Denver, Colorado USA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-800 text-base mb-4">
              Policies
            </h4>
            <div className="space-y-2">
              <div>
                <Link
                  to="/privacy-policy"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link
                  to="/data-policy"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  Data Policy
                </Link>
              </div>
              <div>
                <Link
                  to="/pricing"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-xs">
            © {year} CarerView App | All rights reserved | a GrifDigi company
          </p>
        </div>
      </div>
    </footer>
  );
}

// Provide default export too so either import style works.
export default Footer;
