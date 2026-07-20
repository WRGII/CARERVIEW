import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Activity, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import PageSEO from '../components/seo/PageSEO';
import Breadcrumbs from '../components/common/Breadcrumbs';
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
      <section className="bg-cyan-700 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 border border-white/25 rounded-full text-white text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {t('nav.tutorial')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
            {t('tutorial.page_title')}
          </h1>
          <p className="text-cyan-100 text-lg leading-relaxed max-w-2xl mx-auto">
            {t('tutorial.page_subtitle')}
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ label: t('nav.tutorial') }]} />
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
            {user ? t('tutorial.cta_restart') : t('tutorial.bottom_title')}
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
            <Link
              to="/create-account"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors shadow text-sm"
            >
              {t('tutorial.bottom_cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
