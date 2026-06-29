import type { StripeProduct } from '../../stripe-config';
import { useCheckout } from '../../hooks/useCheckout';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

interface Props {
  product: StripeProduct;
}

export function PricingCard({ product }: Props) {
  const { user } = useAuth();
  const { loading, error, startCheckout } = useCheckout();
  const { product: activeProduct } = useSubscription();

  const isActive = activeProduct?.priceId === product.priceId;

  async function handleSubscribe() {
    await startCheckout({ priceId: product.priceId, mode: product.mode });
  }

  const cardBase =
    'relative flex flex-col rounded-2xl border p-8 transition-all duration-200';
  const cardStyle = product.highlighted
    ? `${cardBase} border-teal-500 bg-white shadow-xl shadow-teal-100 scale-[1.02]`
    : `${cardBase} border-slate-200 bg-white shadow-sm hover:shadow-md`;

  return (
    <div className={cardStyle}>
      {product.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-teal-600 px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-white shadow">
            Best Value
          </span>
        </div>
      )}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          {product.shortName}
        </p>
        <h3 className="mt-1 text-xl font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{product.tagline}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-semibold text-slate-900">
            {product.currencySymbol}{product.billingPrice.toFixed(2)}
          </span>
          <span className="mb-1 text-sm text-slate-500">/ quarter</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">{product.billingNote}</p>
      </div>

      <ul className="mb-8 flex flex-col gap-3">
        {product.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {feat}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        {isActive ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 py-3 text-sm font-medium text-teal-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Current Plan
          </div>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={loading || !user}
            className={`
              relative w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200
              ${product.highlighted
                ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60'}
              ${!user ? 'cursor-not-allowed opacity-50' : ''}
            `}
            title={!user ? 'Sign in to subscribe' : undefined}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting…
              </span>
            ) : !user ? (
              'Sign in to subscribe'
            ) : (
              'Get started'
            )}
          </button>
        )}
      </div>
    </div>
  );
}