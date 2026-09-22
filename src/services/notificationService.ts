// Service Worker & Notification Service for "Mój Werset Dnia"
import { BibleVerse } from '../types';

export interface NotificationSettings {
  optIn: boolean;
  time: string; // "08:00", "09:00", etc.
  lastDeliveredDate: string; // "YYYY-MM-DD"
  lastDeliveredVerseId?: string;
}

const STORAGE_KEY = 'cc_verse_notifications';
const DEFAULT_SETTINGS: NotificationSettings = {
  optIn: false,
  time: '08:00',
  lastDeliveredDate: '',
};

/**
 * Checks if browser supports Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Checks if browser supports Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Gets the current browser permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Retrieves persisted notification preferences from localStorage
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Error reading notification settings', err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Saves notification preferences to localStorage
 */
export function saveNotificationSettings(
  updated: Partial<NotificationSettings>
): NotificationSettings {
  const current = getNotificationSettings();
  const merged: NotificationSettings = { ...current, ...updated };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Error saving notification settings', err);
  }
  return merged;
}

/**
 * Registers the Service Worker (/sw.js)
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    
    // Ensure active service worker is ready
    if (registration.installing) {
      console.log('Service Worker installing...');
    } else if (registration.waiting) {
      console.log('Service Worker installed & waiting.');
    } else if (registration.active) {
      console.log('Service Worker active.');
    }
    return registration;
  } catch (err) {
    console.warn('Failed to register Service Worker:', err);
    return null;
  }
}

/**
 * Requests browser permission for Notifications
 */
export async function requestNotificationPermission(): Promise<{
  status: NotificationPermission | 'unsupported';
  granted: boolean;
  error?: string;
}> {
  if (!isNotificationSupported()) {
    return {
      status: 'unsupported',
      granted: false,
      error: 'Twoja przeglądarka nie obsługuje powiadomień Web Notifications.',
    };
  }

  // If already granted, register service worker and activate opt-in
  if (Notification.permission === 'granted') {
    await registerServiceWorker();
    saveNotificationSettings({ optIn: true });
    return { status: 'granted', granted: true };
  }

  // If explicitly denied
  if (Notification.permission === 'denied') {
    return {
      status: 'denied',
      granted: false,
      error:
        'Powiadomienia są zablokowane w ustawieniach Twojej przeglądarki. Kliknij ikonę kłódki/ustawień przy adresie strony, aby je odblokować.',
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      saveNotificationSettings({ optIn: true });
      return { status: 'granted', granted: true };
    } else {
      saveNotificationSettings({ optIn: false });
      return {
        status: permission,
        granted: false,
        error:
          permission === 'denied'
            ? 'Uprawnienie do powiadomień zostało odrzucone.'
            : 'Nie udzielono jeszcze zgody na powiadomienia.',
      };
    }
  } catch (err: any) {
    console.warn('Notification.requestPermission() exception:', err);
    return {
      status: 'denied',
      granted: false,
      error:
        'Nie udało się wywołać uprawnień powiadomień (w oknie podglądu iframe może być wymagane otwarcie aplikacji w nowej karcie).',
    };
  }
}

/**
 * Opt-out from notifications
 */
export function disableNotifications(): NotificationSettings {
  return saveNotificationSettings({ optIn: false });
}

/**
 * Dispatches a notification for the verse via Service Worker (or fallback Notification API)
 */
export async function sendVerseNotification(
  verse: BibleVerse,
  titlePrefix: string = '✝ Słowo Boże na dziś'
): Promise<{ success: boolean; error?: string }> {
  if (!isNotificationSupported()) {
    return { success: false, error: 'Powiadomienia nie są obsługiwane w tej przeglądarce.' };
  }

  if (Notification.permission !== 'granted') {
    return { success: false, error: 'Brak zgody na wyświetlanie powiadomień w przeglądarce.' };
  }

  const title = `${titlePrefix}: ${verse.reference}`;
  const truncatedText = verse.text.length > 180 ? `${verse.text.slice(0, 177)}...` : verse.text;
  const body = `„${truncatedText}”\n(${verse.translation} • Christian Culture)`;

  const notificationOptions: NotificationOptions = {
    body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'cc-werset-dnia',
    data: {
      url: `/#w/${verse.slug}`,
      verseId: verse.id,
      timestamp: Date.now(),
    },
  };

  try {
    let delivered = false;

    // 1. Try Service Worker registration showNotification first
    if (isServiceWorkerSupported()) {
      let reg: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await registerServiceWorker();
      }
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, notificationOptions);
        delivered = true;
      }
    }

    // 2. Fallback to standard Window Notification constructor if SW isn't ready
    if (!delivered && typeof Notification !== 'undefined') {
      const n = new Notification(title, notificationOptions);
      n.onclick = () => {
        window.focus();
        window.location.hash = `#w/${verse.slug}`;
        n.close();
      };
      delivered = true;
    }

    // Update last delivered date
    const today = new Date().toISOString().split('T')[0];
    saveNotificationSettings({
      lastDeliveredDate: today,
      lastDeliveredVerseId: verse.id,
    });

    return { success: true };
  } catch (err: any) {
    console.error('Failed to send verse notification:', err);
    return {
      success: false,
      error: err?.message || 'Nie udało się wyświetlić powiadomienia.',
    };
  }
}

/**
 * Checks if today's notification should be sent based on user opt-in and scheduled time
 */
export async function checkAndTriggerScheduledNotification(
  verse: BibleVerse
): Promise<boolean> {
  const settings = getNotificationSettings();
  if (!settings.optIn || Notification.permission !== 'granted') {
    return false;
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // If already delivered today, skip
  if (settings.lastDeliveredDate === todayStr) {
    return false;
  }

  // Parse preferred notification time (e.g. "08:00")
  const [prefHour, prefMinute] = (settings.time || '08:00').split(':').map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // If current time has reached or passed preferred time today
  const hasReachedTime =
    currentHour > prefHour || (currentHour === prefHour && currentMinute >= prefMinute);

  if (hasReachedTime) {
    const result = await sendVerseNotification(verse, '✝ Twój poranny Werset Dnia');
    return result.success;
  }

  return false;
}
