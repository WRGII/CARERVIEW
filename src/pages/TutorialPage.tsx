import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Activity, Users, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import PageSEO from '../components/seo/PageSEO';
import { SITE_URL } from '../lib/siteConfig';

type StepCard = {
  num: string;
  icon: React.ElementType;
  titleKey: string;
  bodyKey: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  border: string;
};

const STEP_CARDS: StepCard[] = [
  {
    num: '01',
    icon: Sparkles,
    titleKey: 'tutorial.step1_title',
    bodyKey: 'tutorial.step1_body',
    accent: 'from-cyan-50 to-white',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  {
    num: '02',
    icon: BookOpen,
    titleKey: 'tutorial.step2_title',
    bodyKey: 'tutorial.step2_body',
    accent: 'from-teal-50 to-white',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    border: 'border-teal-200',
  },
  {
    num: '03',
    icon: ClipboardList,
    titleKey: 'tutorial.step3_title',
    bodyKey: 'tutorial.step3_body',
    accent: 'from-blue-50 to-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    border: 'border-blue-200',
  },
  {
    num: '04',
    icon: Activity,
    titleKey: 'tutorial.step4_title',
    bodyKey: 'tutorial.step4_body',
    accent: 'from-amber-50 to-white',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    num: '05',
    icon: Users,
    titleKey: 'tutorial.step5_title',
    bodyKey: 'tutorial.step5_body',
    accent: 'from-slate-50 to-white',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    border: 'border-slate-200',
  },
];

const QUICK_WINS = [
  'tutorial.step2_title',
  'tutorial.step3_title',
  'tutorial.step4_title',
  'tutorial.step5_title',
];

export default function TutorialPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { restartTutorial } = useOnboarding();

  function handleRestartTutorial() {
    restartTutorial();
    window.location.assign('/caregiver');
  }

  return (
    <>
      <PageSEO
        title={`${t('tutorial.page_title')} | CarerView`}
        description={t('tutorial.public_description')}
        canonical={`${SITE_URL}/tutorial`}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t('nav.tutorial')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {t('tutorial.page_title')}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
            {t('tutorial.page_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <button
                onClick={handleRestartTutorial}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 text-sm"
              >
                {t('tutorial.cta_restart')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/create-account"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 text-sm"
                >
                  {t('tutorial.cta_start')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/#get-started"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all duration-200 text-sm"
                >
                  {t('nav.sign_in')}
                </Link>
              </>
            )}
          </div>

          {/* Quick feature list */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {QUICK_WINS.map((key) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                {t(key)}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t('tutorial.public_description')}
            </h2>
          </div>

          <div className="space-y-4">
            {STEP_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.num}
                  className={`flex gap-5 p-6 rounded-2xl border bg-gradient-to-r ${card.accent} ${card.border} group hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{card.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">{t(card.titleKey)}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t(card.bodyKey)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            {user ? t('tutorial.cta_restart') : t('tutorial.cta_start')}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {t('tutorial.public_description')}
          </p>
          {user ? (
            <button
              onClick={handleRestartTutorial}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors shadow text-sm"
            >
              {t('tutorial.cta_restart')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/create-account"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors shadow text-sm"
              >
                {t('tutorial.cta_start')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
              >
                {t('footer.pricing_link')}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
