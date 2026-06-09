import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLocale } from '../i18n/LocaleContext';

async function fireWelcomeEmail(accessToken: string): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-welcome`;
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  }).catch(() => {/* fire-and-forget */});
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const processed = useRef(false);
  const { t } = useLocale();

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
        // Fire welcome email idempotently — the function skips if already sent.
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) fireWelcomeEmail(session.access_token);
        });
        const hasPendingCheckout = !!localStorage.getItem('cv_pending_checkout');
        if (hasPendingCheckout) {
          navigate('/create-account', { replace: true });
          return;
        }
        const joinToken = localStorage.getItem('cv_join_token');
        if (joinToken) {
          localStorage.removeItem('cv_join_token');
          navigate(`/join?t=${encodeURIComponent(joinToken)}`, { replace: true });
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
        <p className="text-sm text-slate-gray/60">{t('auth_callback.verifying')}</p>
      </div>
    </div>
  );
}
