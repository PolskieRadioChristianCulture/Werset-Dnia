declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type AnalyticsEventName =
  | 'verse_generated'
  | 'verse_searched'
  | 'background_changed'
  | 'background_custom_applied'
  | 'share_clicked'
  | 'download_clicked'
  | 'lumina_login_started'
  | 'lumina_login_completed'
  | 'verse_shared'
  | 'verse_saved'
  | 'publish_to_lumina_clicked'
  | 'topic_viewed'
  | 'question_viewed';

/**
 * Tracks analytics events for Google Analytics G-M24C85RG49 and internal metrics
 * without storing private user query details needlessly.
 */
export function trackEvent(name: AnalyticsEventName, params?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        app_name: 'moj_werset_dnia',
        ecosystem: 'christian_culture',
        portal: 'lumina',
        ...params,
      });
    }
  } catch (err) {
    console.debug('Analytics tracking skipped', err);
  }
}
