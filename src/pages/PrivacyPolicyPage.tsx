import { Link } from "react-router-dom";
import { Shield, Mail, ArrowLeft } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import PageSEO from "../components/seo/PageSEO";
import { SITE_URL } from "../lib/siteConfig";

export default function PrivacyPolicyPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <PageSEO
        title="Privacy Policy - CarerView"
        description="Read the CarerView privacy policy to understand how we collect, use, and protect your personal data and caregiver information."
        canonical={`${SITE_URL}/privacy-policy`}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-gray/60 hover:text-cyan-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.go_home')}
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">
              {t('policy.privacy_title')}
            </h1>
          </div>

          <div className="space-y-8 text-slate-gray leading-relaxed">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <p className="text-amber-800 font-medium text-sm">
                {t('policy.privacy_notice')}
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.collect_title')}
              </h2>
              <p>
                {t('policy.collect_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.use_title')}
              </h2>
              <p>
                {t('policy.use_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.storage_title')}
              </h2>
              <p>
                {t('policy.storage_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.rights_title')}
              </h2>
              <p>
                {t('policy.rights_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.cookies_title')}
              </h2>
              <p>
                {t('policy.cookies_body')}
              </p>
            </section>

            <div className="pt-6 border-t border-slate-gray/10">
              <p className="text-sm text-slate-gray/60">
                {t('policy.last_updated')}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-cyan-primary" />
                <span className="text-slate-gray/70">{t('policy.questions')}</span>
                <a
                  href="mailto:CarerView@GrifDigi.com"
                  className="text-cyan-primary hover:text-cyan-hover underline"
                >
                  CarerView@GrifDigi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
