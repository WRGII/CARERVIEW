import { Link } from "react-router-dom";
import { Database, Mail, ArrowLeft } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";

export default function DataPolicyPage() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
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
              <Database className="w-5 h-5 text-cyan-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">
              {t('policy.data_title')}
            </h1>
          </div>

          <div className="space-y-8 text-slate-gray leading-relaxed">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <p className="text-amber-800 font-medium text-sm">
                {t('policy.data_notice')}
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.create_title')}
              </h2>
              <p>
                {t('policy.create_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.sharing_title')}
              </h2>
              <p>
                {t('policy.sharing_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.retention_title')}
              </h2>
              <p>
                {t('policy.retention_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.export_title')}
              </h2>
              <p>
                {t('policy.export_body')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                {t('policy.disclaimer_title')}
              </h2>
              <p>
                {t('policy.disclaimer_body')}
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
