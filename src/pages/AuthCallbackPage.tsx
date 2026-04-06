import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const next = params.get('next') ?? '/';
    const hasCode = !!params.get('code');

    if (!hasCode) {
      const errorType = type === 'recovery' ? 'recovery' : 'generic';
      navigate(`/auth/error?reason=no_code&type=${errorType}`, { replace: true });
      return;
    }

    const timeout = setTimeout(() => {
      const errorType = type === 'recovery' ? 'recovery' : 'generic';
      navigate(`/auth/error?reason=link_expired&type=${errorType}`, { replace: true });
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && type === 'recovery')) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        navigate('/reset-password', { replace: true });
        return;
      }

      if (event === 'SIGNED_IN') {
        clearTimeout(timeout);
        subscription.unsubscribe();
        const hasPendingCheckout = !!localStorage.getItem('cv_pending_checkout');
        if (hasPendingCheckout) {
          navigate('/create-account', { replace: true });
          return;
        }
        navigate(next, { replace: true });
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
        </div>
        <p className="text-sm text-slate-gray/60">Verifying your link...</p>
      </div>
    </div>
  );
}
