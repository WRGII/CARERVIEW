import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { STRIPE_PRODUCTS } from '../stripe-config';
import { PricingCard } from '../components/PricingCard';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useCheckout } from '../hooks/useCheckout';
import { StripeProduct } from '../stripe-config';

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'HIPAA-aligned data handling keeps sensitive observations protected.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Insights',
    desc: 'Automatic reports surface patterns over time so nothing gets missed.',
  },
  {
    icon: Users,
    title: 'Family Coordination',
    desc: 'Share observations across your care team in one unified timeline.',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription(user);
  const { startCheckout, loading, error } = useCheckout();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const handleSelect = (product: StripeProduct) => {
    setSelectedPriceId(product.priceId);
    startCheckout(product);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-teal-950 via-teal-900 to-teal-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.15)_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-800/60 border border-teal-700/50 text-teal-300 text-sm font-medium mb-8">
            <Heart className="w-3.5 h-3.5" fill="currentColor" />
            Thoughtful caregiving tools
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.15] text-balance">
            Every observation matters.{' '}
            <span className="text-teal-300">Nothing gets lost.</span>
          </h1>
          <p className="text-lg text-teal-200/80 mb-10 max-w-xl mx-auto leading-relaxed">
            CarerView helps families and caregivers track, share, and understand what matters most — with clarity and care.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#pricing"
              className="px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-400 transition-colors flex items-center justify-center gap-2"
            >
              View plans
              <ArrowRight className="w-4 h-4" />
            </a>
            {!user && (
              <Link
                to="/auth"
                className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium border border-white/20 hover:bg-white/20 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Built for real caregiving moments</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Simple tools that fit naturally into your day, not add to it.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-gray-500">Choose the plan that fits your care team. Cancel anytime.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {STRIPE_PRODUCTS.map((product) => (
              <PricingCard
                key={product.priceId}
                product={product}
                subscription={subscription}
                onSelect={handleSelect}
                loading={loading}
                selectedPriceId={selectedPriceId}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Secure checkout via Stripe. Cancel or change plans anytime.
          </p>
        </div>
      </section>
    </div>
  );
}