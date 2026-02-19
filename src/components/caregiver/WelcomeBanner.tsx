import { X, Heart } from 'lucide-react';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function WelcomeBanner() {
  const { showWelcome, dismissWelcome, isLoading } = useOnboarding();

  if (isLoading || !showWelcome) return null;

  return (
    <div className="relative mb-6 bg-gradient-to-r from-cyan-50 to-mint-green/20 border border-cyan-200 rounded-xl p-5 animate-slide-up">
      <button
        onClick={dismissWelcome}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Dismiss welcome message"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-700 mb-1">Welcome to CarerView</h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            You're in the right place. Start by creating your first observation whenever you're ready -- there's no rush.
            Each one helps the whole care team stay on the same page.
          </p>
        </div>
      </div>
    </div>
  );
}
