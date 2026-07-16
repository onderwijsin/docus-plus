import type { TrackEventParams } from "#layers/docus-plus/app/types/tracking";

/**
 * Composable that exposes a thin wrapper around the global analytics `useTrackEvent` helper.
 *
 * Typical usage:
 *
 * ```ts
 * const { trackEvent } = useTracking()
 *
 * trackEvent('login', {
 *   event_category: 'auth',
 *   event_label: 'login_success',
 * })
 * ```
 *
 * @returns An object with:
 * - `trackEvent`: Function to send a typed tracking event with analytics payload.
 */
export const useTracking = () => {
  const config = useRuntimeConfig().public;
  /**
   * Send a tracking event to the analytics layer when tracking is allowed.
   *
   * The event is only sent when:
   * - Tracking is not disabled globally
   * - The code runs on the client (`import.meta.client`)
   *
   * @param event_name - Name of the event to track. Arbitrary strings are accepted for flexibility.
   * @param payload - Analytics payload describing the event context, including
   *                  category and optional label/value.
   *
   * @example
   * ```ts
   * const { trackEvent } = useTracking()
   *
   * trackEvent('app_installed', {
   *   event_category: 'engagement',
   *   event_label: 'pwa_install_prompt_accepted',
   * })
   * ```
   */
  const trackEvent = (event_name: string, payload: TrackEventParams) => {
    if (config.tracking.disabled || !import.meta.client) return;
    useTrackEvent(event_name, { props: { ...payload } });
  };

  return {
    trackEvent
  };
};
