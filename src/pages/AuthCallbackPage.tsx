import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLocale } from '../i18n/LocaleContext';

const TIMEOUT_MS = 30_000;

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

async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data } = await supabase
    .rpc('cv_get_effective_plan', { p_user_id: userId })
    .maybeSingle() as { data: Record<string, any> | null; error: any };
  if (!data) return false;
  const okStatus = data.status === 'active' || data.status === 'trialing';
  if (!okStatus) return false;
  const end = data.current_period_end ? Date.parse(data.current_period_end) : NaN;
  return !Number.isNaN(end) && Date.now() < end;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const processed = useRef(false);
  const { t } = useLocale();
  const [timedOut, setTimedOut] = useState(false);

  function retry() {
    processed.current = false;
    setTimedOut(false);
    // Re-trigger the effect by navigating to the same URL
    window.location.reload();
  }

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
      setTimedOut(true);
    }, TIMEOUT_MS);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
        if (session?.access_token) fireWelcomeEmail(session.access_token);

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
        // For non-recovery sign-ins, check whether the user has a subscription.
        // New users confirming their email will have none — send them to choose a plan.
        const userId = session?.user?.id;
        if (userId) {
          hasActiveSubscription(userId).then((active) => {
            navigate(active ? next : '/create-account?incomplete=1', { replace: true });
          }).catch(() => {
            navigate('/create-account?incomplete=1', { replace: true });
          });
        } else {
          navigate(next, { replace: true });
        }
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
          <p className="text-slate-700 font-medium">Taking longer than expected</p>
          <p className="text-sm text-slate-500">
            The link may have expired or the connection timed out. Try clicking the link in your email again, or retry below.
          </p>
          <button
            onClick={retry}
            className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/sign-in', { replace: true })}
            className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

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
