import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { getProductByPriceId } from '../stripe-config';
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react';

interface SubscriptionData {
  status: string;
  price_id: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, price_id, current_period_end, cancel_at_period_end')
        .in('status', ['active', 'trialing'])
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as SubscriptionData | null;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Clock className="w-4 h-4 animate-spin" />
        <span>Loading subscription...</span>
      </div>
    );
  }

  if (!subscription || subscription.status === 'canceled') {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <AlertCircle className="w-4 h-4 text-yellow-500" />
        <span>No active subscription</span>
      </div>
    );
  }

  const product = getProductByPriceId(subscription.price_id);
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const periodEnd = new Date(subscription.current_period_end);

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isActive ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-yellow-500" />
      )}
      <div>
        <span className="font-medium">
          {product?.name.replace('CarerView - ', '').replace(' Plan', '') || 'Unknown Plan'}
        </span>
        {subscription.cancel_at_period_end ? (
          <span className="text-yellow-600 ml-2">
            (Cancels {periodEnd.toLocaleDateString()})
          </span>
        ) : (
          <span className="text-gray-600 ml-2">
            (Renews {periodEnd.toLocaleDateString()})
          </span>
        )}
      </div>
    </div>
  );
}