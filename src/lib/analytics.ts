/**
 * Thin GA4 wrapper. No-ops gracefully when:
 *   - Running on the server (SSR / static build).
 *   - NEXT_PUBLIC_GA4_MEASUREMENT_ID is unset.
 *   - The gtag script hasn't loaded yet.
 *
 * The script tag itself is injected by src/app/layout.tsx (only when the
 * env var is present), which ensures unconfigured envs ship zero analytics.
 */

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? '';

type GtagArgs =
  | ['event', string, Record<string, unknown>?]
  | ['config', string, Record<string, unknown>?]
  | ['set', Record<string, unknown>]
  | ['js', Date];

interface GtagWindow extends Window {
  gtag?: (...args: GtagArgs) => void;
  dataLayer?: unknown[];
}

function getGtag(): GtagWindow['gtag'] | null {
  if (typeof window === 'undefined') return null;
  if (!GA4_MEASUREMENT_ID) return null;
  return (window as GtagWindow).gtag ?? null;
}

export function track(event: string, params?: Record<string, unknown>): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag('event', event, params);
}

export function identify(userId: string): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag('config', GA4_MEASUREMENT_ID, { user_id: userId });
}
