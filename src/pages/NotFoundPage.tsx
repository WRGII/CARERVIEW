import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-8xl font-bold text-slate-gray/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-gray mb-3">
          {t('not_found.title')}
        </h1>
        <p className="text-slate-gray/70 mb-8 leading-relaxed">
          {t('not_found.body')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-primary px-6 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all"
          >
            <Home className="w-4 h-4" />
            {t('common.go_home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-gray/20 px-6 py-3 text-base font-medium text-slate-gray hover:bg-slate-gray/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.go_back')}
          </button>
        </div>
      </div>
    </div>
  );
}
