import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';

const STEPS = [
  {
    path: '/caregiver',
    title: 'Welcome to CarerView',
    body: "You know your loved one best. Let's walk through how to capture your first observation. It only takes a few minutes.",
    target: null,
  },
  {
    path: '/caregiver',
    title: 'Start an observation',
    body: 'Tap "New Observation" whenever you want to record what you\'re seeing.',
    target: '[data-tutorial="new-observation"]',
  },
  {
    path: '/caregiver/observations/new',
    title: 'Choose Daily Living Activities',
    body: 'This is the most popular choice. It covers the daily basics -- eating, dressing, bathing, and getting around.',
    target: '[data-tutorial="adl-tile"]',
  },
];

export default function GuidedTutorial() {
  const { showTutorial, currentStep, setStep, completeTutorial, dismissTutorial } = useOnboarding();
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
            aria-label="Skip tutorial"
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

          <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
          <p className="text-slate-700 leading-relaxed mb-5">{step.body}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={dismissTutorial}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Skip tutorial
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors min-h-[44px]"
              >
                {isLastStep ? 'Done' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
