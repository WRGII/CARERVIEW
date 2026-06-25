import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserSubscription } from '../types';
import { User } from '@supabase/supabase-js';

interface SubscriptionState {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription(user: User | null): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setState({ subscription: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setState({ subscription: null, loading: false, error: error.message });
        } else {
          setState({ subscription: data, loading: false, error: null });
        }
      });
  }, [user]);

  return state;
}