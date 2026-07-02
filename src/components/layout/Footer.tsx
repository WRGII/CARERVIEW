import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useLocale } from "../../i18n/LocaleContext";
import { useAuth } from "../../hooks/useAuth";
import LanguageSwitcher from "../common/LanguageSwitcher";

export function Footer() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = React.useState<string>(
    "/CareView_logo_icon_only.png"
  );

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img
                src={logoUrl}
                alt={t('common.app_name')}
                className="w-8 h-8 object-contain opacity-80"
              />
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="mt-4 space-y-2">
              <div>
                <Link
                  to="/about"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('footer.about_link')}
                </Link>
              </div>
              <div>
                <Link
                  to="/memory-book"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('nav.memory_book')}
                </Link>
              </div>
              <div>
                <Link
                  to="/why"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('nav.why_carerview')}
                </Link>
              </div>
              <div>
                <Link
                  to="/pricing"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('footer.pricing_link')}
                </Link>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-800 text-base mb-4">
              {t('footer.resources_heading')}
            </h4>
            <div className="space-y-2">
              <div>
                <Link
                  to="/caregiver/resources"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('nav.caregiver_resources')}
                </Link>
              </div>
              <div>
                <Link
                  to="/new-carer"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('nav.new_carer')}
                </Link>
              </div>
              <div>
                <Link
                  to="/community"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('nav.caregiver_forum')}
                </Link>
              </div>
              <div>
                <Link
                  to="/tutorial"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('footer.tutorial_link')}
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-800 text-base mb-4">
              {t('footer.contact')}
            </h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div>
                <span className="block text-slate-700 font-medium mb-1">
                  {t('footer.suggestions')}
                </span>
                <a
                  href="mailto:CarerView@GrifDigi.com"
                  className="text-cyan-primary hover:text-cyan-hover underline"
                >
                  CarerView@GrifDigi.com
                </a>
              </div>
              <div className="mt-3">
                <span className="block text-slate-700 font-medium mb-1">
                  {t('footer.locations')}
                </span>
                <div className="space-y-1">
                  <div>{t('footer.location_nz')}</div>
                  <div>{t('footer.location_us')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-slate-800 text-base mb-4">
              {t('footer.policies')}
            </h4>
            <div className="space-y-3">
              {!user && (
                <div>
                  <Link
                    to="/sign-in"
                    className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                  >
                    {t('footer.sign_in_link')}
                  </Link>
                </div>
              )}
              <div>
                <Link
                  to="/privacy"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('footer.privacy_policy')}
                </Link>
              </div>
              <div>
                <Link
                  to="/data-policy"
                  className="text-cyan-primary hover:text-cyan-hover font-medium underline text-sm"
                >
                  {t('footer.data_policy')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Language + Copyright Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <LanguageSwitcher />
          <p className="text-slate-500 text-xs">
            {t('footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
