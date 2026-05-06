import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft, BookOpen, ClipboardList, Activity, Users } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useLocale } from '../../i18n/LocaleContext';

type StepDef = {
  path: string;
  title: string;
  body: string;
  target: string | null;
  icon: React.ElementType;
  accent: string;
};

export default function GuidedTutorial() {
  const { showTutorial, currentStep, setStep, completeTutorial, dismissTutorial } = useOnboarding();
  const { t } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();

  const STEPS: StepDef[] = [
    {
      path: '/caregiver',
      title: t('tutorial.step1_title'),
      body: t('tutorial.step1_body'),
      target: null,
      icon: Activity,
      accent: 'bg-cyan-50 border-cyan-200',
    },
    {
      path: '/caregiver',
      title: t('tutorial.step2_title'),
      body: t('tutorial.step2_body'),
      target: '[data-tutorial="memory-book-panel"]',
      icon: BookOpen,
      accent: 'bg-teal-50 border-teal-200',
    },
    {
      path: '/caregiver',
      title: t('tutorial.step3_title'),
      body: t('tutorial.step3_body'),
      target: '[data-tutorial="care-plan-panel"]',
      icon: ClipboardList,
      accent: 'bg-blue-50 border-blue-200',
    },
    {
      path: '/caregiver',
      title: t('tutorial.step4_title'),
      body: t('tutorial.step4_body'),
      target: '[data-tutorial="new-observation"]',
      icon: Activity,
      accent: 'bg-amber-50 border-amber-200',
    },
    {
      path: '/caregiver',
      title: t('tutorial.step5_title'),
      body: t('tutorial.step5_body'),
      target: '[data-tutorial="family-circle"]',
      icon: Users,
      accent: 'bg-slate-50 border-slate-200',
    },
  ];

  const step = STEPS[currentStep];
  const isLastStep = currentStep >= STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      completeTutorial();
    } else {
      const nextStep = currentStep + 1;
      const nextPath = STEPS[nextStep].path;
      setStep(nextStep);
      if (nextPath !== location.pathname) {
        navigate(nextPath);
      }
    }
  }, [isLastStep, currentStep, completeTutorial, setStep, navigate, location.pathname, STEPS]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const prevPath = STEPS[prevStep].path;
      setStep(prevStep);
      if (prevPath !== location.pathname) {
        navigate(prevPath);
      }
    }
  }, [currentStep, setStep, navigate, location.pathname, STEPS]);

  useEffect(() => {
    if (!showTutorial || !step?.target) return;
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showTutorial, step?.target, currentStep]);

  if (!showTutorial || !step) return null;

  const isOnCorrectPage =
    location.pathname === step.path || location.pathname.startsWith(step.path + '/');
  if (!isOnCorrectPage) return null;

  const Icon = step.icon;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={dismissTutorial} aria-hidden="true" />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className={`bg-white rounded-2xl shadow-2xl border-2 ${step.accent} p-6 relative`}
          style={{ animation: 'slideUp 0.2s ease-out' }}
        >
          <button
            onClick={dismissTutorial}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100"
            aria-label={t('tutorial.skip_aria')}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < currentStep
                    ? 'bg-cyan-500'
                    : i === currentStep
                    ? 'bg-cyan-400'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Step label */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t('tutorial.step_label')
              .replace('{current}', String(currentStep + 1))
              .replace('{total}', String(STEPS.length))}
          </p>

          {/* Icon + title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800 leading-snug">{step.title}</h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-5 pl-11">{step.body}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={dismissTutorial}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {t('tutorial.skip')}
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-h-[36px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('common.back')}
                </button>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition-colors min-h-[36px]"
              >
                {isLastStep ? t('common.done') : t('common.next')}
                {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
