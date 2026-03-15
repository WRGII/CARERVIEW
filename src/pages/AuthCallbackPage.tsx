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
    const code = params.get('code');
    const type = params.get('type');
    const next = params.get('next') ?? '/';

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          navigate('/?error=auth_callback_failed', { replace: true });
          return;
        }
        if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
        } else {
          navigate(next, { replace: true });
        }
      });
    } else {
      navigate('/', { replace: true });
    }
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
