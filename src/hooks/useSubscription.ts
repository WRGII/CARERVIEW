import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId, type StripeProduct } from '../stripe-config';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionState {
  loading: boolean;
  product: StripeProduct | null;
  status: string | null;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    product: null,
    status: null,
  });

  useEffect(() => {
    if (!user) {
      setState({ loading: false, product: null, status: null });
      return;
    }

    let cancelled = false;

    async function fetchSubscription() {
      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .select('price_id, status')
        .in('status', ['active', 'trialing'])
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setState({ loading: false, product: null, status: null });
        return;
      }

      const product = data.price_id ? getProductByPriceId(data.price_id) ?? null : null;
      setState({ loading: false, product, status: data.status });
    }

    fetchSubscription();
    return () => { cancelled = true; };
  }, [user]);

  return state;
}