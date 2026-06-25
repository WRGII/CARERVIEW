import { Sparkles } from 'lucide-react';
import { UserSubscription } from '../types';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionBadgeProps {
  subscription: UserSubscription | null;
}

const ACTIVE_STATUSES = ['active', 'trialing'];

export function SubscriptionBadge({ subscription }: SubscriptionBadgeProps) {
  if (!subscription || !ACTIVE_STATUSES.includes(subscription.subscription_status ?? '')) {
    return null;
  }

  const product = subscription.price_id
    ? getProductByPriceId(subscription.price_id)
    : null;

  const label = product?.shortName ?? 'Active Plan';

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  );
}