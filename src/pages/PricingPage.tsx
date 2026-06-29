import { STRIPE_PRODUCTS } from '../stripe-config';
import { PricingCard } from '../components/pricing/PricingCard';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';

export function PricingPage() {
  const { user } = useAuth();
  const { product: activeProduct, loading } = useSubscription();

  return (
    <main className="min-h-screen pt-16">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center animate-fade-in">
          <span className="inline-block rounded-full bg-teal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-700 ring-1 ring-teal-200">
            Plans &amp; Pricing
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Care together. Save together.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
            Choose the plan that fits your family's needs. All plans include trend reports and PDF summaries — cancel any time.
          </p>

          {!loading && user && activeProduct && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-5 py-2 text-sm font-medium text-teal-800 ring-1 ring-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              You're on the <strong>{activeProduct.shortName}</strong> plan
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto animate-slide-up">
          {STRIPE_PRODUCTS.map((product) => (
            <PricingCard key={product.id} product={product} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-slate-400">
          Prices in USD. Billed every three months. Cancel anytime — no long-term commitment.
        </p>
      </section>
    </main>
  );
}