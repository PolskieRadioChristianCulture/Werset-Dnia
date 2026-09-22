import { LuminaUser } from '../types';
import { trackEvent } from '../utils/analytics';

const STORAGE_KEY = 'cc_lumina_user_session';
const SAVED_VERSES_KEY = 'cc_lumina_saved_verses';
const HISTORY_KEY = 'cc_lumina_verse_history';

export const SPECIAL_PROFILES = [
  {
    id: 'cezary-rogowski',
    name: 'Cezary Rogowski',
    email: 'cezary@polskieradio.cc',
    role: 'Założyciel Christian Culture',
    status: 'Żonaty',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'wioletta-rogowska',
    name: 'Wioletta Rogowska',
    email: 'wioletta@polskieradio.cc',
    role: 'Współzałożycielka Christian Culture',
    status: 'Mężatka',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'andrzej-thiel',
    name: 'Andrzej Thiel',
    email: 'andrzej@polskieradio.cc',
    role: 'Autor rozważań „Cuda Każdego Dnia”',
    status: 'Lektor i Autor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

export function getStoredLuminaUser(): LuminaUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function getStoredSavedVerseIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_VERSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function getStoredHistory(): { verseId: string; bgId: string; timestamp: number }[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveLuminaSession(user: LuminaUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    trackEvent('lumina_login_completed', { user_id: user.id, role: user.role });
  } catch (e) {
    console.error('Failed to save LUMINA session', e);
  }
}

export function logoutLuminaSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to logout', e);
  }
}

export function addVerseToFavorites(verseId: string): string[] {
  const current = getStoredSavedVerseIds();
  if (!current.includes(verseId)) {
    const updated = [verseId, ...current];
    try {
      localStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(updated));
      trackEvent('verse_saved', { verse_id: verseId });
    } catch (e) {
      console.error(e);
    }
    return updated;
  }
  return current;
}

export function removeVerseFromFavorites(verseId: string): string[] {
  const current = getStoredSavedVerseIds();
  const updated = current.filter(id => id !== verseId);
  try {
    localStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function recordVerseHistory(verseId: string, bgId: string): void {
  const history = getStoredHistory();
  // Filter out recent identical entry
  const filtered = history.filter(h => h.verseId !== verseId);
  const updated = [{ verseId, bgId, timestamp: Date.now() }, ...filtered].slice(0, 30);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Creates or logs in a user profile into LUMINA
 */
export function loginToLumina(email: string, name?: string): LuminaUser {
  // Check if matches special profiles
  const special = SPECIAL_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
  
  const user: LuminaUser = {
    id: special ? special.id : `lumina-${Date.now().toString(36)}`,
    name: special ? special.name : (name || email.split('@')[0] || 'Użytkownik LUMINA'),
    email: email,
    role: special ? special.role : 'Członek Społeczności Christian Culture',
    avatarUrl: special?.avatarUrl,
    isLoggedIn: true,
    savedVerseIds: getStoredSavedVerseIds(),
    history: getStoredHistory(),
  };

  saveLuminaSession(user);
  return user;
}
