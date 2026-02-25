import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useLocale } from '../../i18n/LocaleContext';

export default function GuidedTutorial() {
  const { showTutorial, currentStep, setStep, completeTutorial, dismissTutorial } = useOnboarding();
  const { t } = useLocale();

  const STEPS = [
    {
      path: '/caregiver',
      title: t('tutorial.step1_title'),
      body: t('tutorial.step1_body'),
      target: null,
    },
    {
      path: '/caregiver',
      title: t('tutorial.step2_title'),
      body: t('tutorial.step2_body'),
      target: '[data-tutorial="new-observation"]',
    },
    {
      path: '/caregiver/observations/new',
      title: t('tutorial.step3_title'),
      body: t('tutorial.step3_body'),
      target: '[data-tutorial="adl-tile"]',
    },
  ];
  const location = useLocation();

  const step = STEPS[currentStep];
  const isLastStep = currentStep >= STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      completeTutorial();
    } else {
      setStep(currentStep + 1);
    }
  }, [isLastStep, currentStep, completeTutorial, setStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setStep(currentStep - 1);
  }, [currentStep, setStep]);

  useEffect(() => {
    if (!showTutorial || !step?.target) return;
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showTutorial, step?.target]);

  if (!showTutorial || !step) return null;

  const isOnCorrectPage = location.pathname === step.path || location.pathname.startsWith(step.path + '/');

  if (!isOnCorrectPage) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={dismissTutorial} />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative animate-slide-up">
          <button
            onClick={dismissTutorial}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={t('tutorial.skip_aria')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-cyan-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold text-slate-700 mb-2">{step.title}</h3>
          <p className="text-slate-700 leading-relaxed mb-5">{step.body}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={dismissTutorial}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              {t('tutorial.skip')}
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('common.back')}
                </button>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors min-h-[44px]"
              >
                {isLastStep ? t('common.done') : t('common.next')}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
