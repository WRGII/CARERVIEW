// Google Ads conversion tracking helpers.
// Conversion labels are created in the Google Ads UI under
// Tools > Conversions > Add conversion action > Website.
// Drop the generated label string into the matching constant below.
// Until a label is set, trackGoogleAdsConversion is a no-op.

export const GOOGLE_ADS_ID = 'AW-18335961182';

export const CONVERSION_LABELS = {
  signup: '',
  beginCheckout: '',
  purchase: '',
} as const;

export type ConversionName = keyof typeof CONVERSION_LABELS;

function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Fire a Google Ads conversion event. No-ops until the matching label is set.
 */
export function trackGoogleAdsConversion(
  name: ConversionName,
  options?: { value?: number; currency?: string; transactionId?: string },
): void {
  const label = CONVERSION_LABELS[name];
  if (!label) return;
  if (!isGtagAvailable()) return;

  const payload: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
  };
  if (typeof options?.value === 'number') payload.value = options.value;
  if (options?.currency) payload.currency = options.currency;
  if (options?.transactionId) payload.transaction_id = options.transactionId;

  window.gtag('event', 'conversion', payload);
}

/**
 * Fire a Google Ads custom event (e.g. begin_checkout, sign_up) for GA4-style
 * reporting under the same gtag stream. No-ops when gtag is unavailable.
 */
export function trackGoogleAdsEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (!isGtagAvailable()) return;
  window.gtag('event', name, params);
}
