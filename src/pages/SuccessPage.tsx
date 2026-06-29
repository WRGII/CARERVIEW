import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { product, loading } = useSubscription();
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 500);
    return () => clearInterval(id);
  }, [loading]);

  return (
    <main className="flex min-h-screen items-center justify-center pt-16 px-6">
      <div className="w-full max-w-md animate-slide-up text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 ring-8 ring-teal-100">
          <svg
            className="h-10 w-10 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            strokeDasharray="100"
            strokeDashoffset="0"
            style={{ animation: 'checkDraw 0.6s ease-out 0.2s both' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold text-slate-900">Payment successful!</h1>

        {loading ? (
          <p className="mt-3 text-slate-500">Loading your plan{dots}</p>
        ) : product ? (
          <>
            <p className="mt-3 text-slate-500">
              Welcome to the{' '}
              <span className="font-semibold text-teal-700">{product.shortName}</span> plan.
            </p>
            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-6 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
                Your plan
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{product.name}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="mt-3 text-slate-500">
            Your subscription is active. It may take a moment to reflect.
          </p>
        )}

        {sessionId && (
          <p className="mt-4 text-xs text-slate-400">
            Reference: <span className="font-mono">{sessionId.slice(-12)}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            to="/pricing"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    </main>
  );
}