import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { StripeProduct } from '../stripe-config';

interface CheckoutState {
  loading: boolean;
  error: string | null;
}

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>({ loading: false, error: null });

  const startCheckout = async (product: StripeProduct) => {
    setState({ loading: true, error: null });

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        sessionStorage.setItem('pending_price_id', product.priceId);
        window.location.href = '/auth';
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/#pricing`,
          mode: product.mode,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setState({ loading: false, error: (err as Error).message });
    }
  };

  return { ...state, startCheckout };
}