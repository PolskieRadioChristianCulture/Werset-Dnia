import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { LuminaUser, BibleVerse, BackgroundTheme } from '../types';

export function isFirebaseAuthActive(userId?: string): boolean {
  return !!auth.currentUser && (!userId || auth.currentUser.uid === userId);
}

export async function syncUserProfileToFirestore(user: LuminaUser): Promise<void> {
  if (!isFirebaseAuthActive(user.id)) return;
  const path = `users/${user.id}`;
  try {
    // 1. Zapis w kolekcji users
    await setDoc(
      doc(db, 'users', user.id),
      {
        id: user.id,
        uid: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        role: user.role || 'Społeczność LUMINA',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. Automatyczne utworzenie profilu w Społeczności LUMINA (kolekcja lumina_profiles)
    await setDoc(
      doc(db, 'lumina_profiles', user.id),
      {
        id: user.id,
        uid: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        role: 'Społeczność LUMINA',
        bio: 'Użytkownik ekosystemu Christian Culture & LUMINA',
        slug: user.id,
        source: 'werset-dnia',
        isCommunityMember: true,
        faithValues: ['Słowo Boże', 'Modlitwa', 'Werset Dnia'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. Synchronizacja kluczy lokalnych LUMINA dla całego portalu polskieradio.cc
    try {
      localStorage.setItem('lumina_current_user', JSON.stringify({
        uid: user.id,
        email: user.email,
        displayName: user.name,
        photoURL: user.avatarUrl || ''
      }));
      localStorage.setItem('lumina_current_user_profile', JSON.stringify({
        id: user.id,
        name: user.name,
        role: 'Społeczność LUMINA',
        avatarUrl: user.avatarUrl || '',
        slug: user.id
      }));
      localStorage.setItem('lumina_my_profile', JSON.stringify({
        id: user.id,
        name: user.name,
        role: 'Społeczność LUMINA',
        avatarUrl: user.avatarUrl || '',
        slug: user.id
      }));
    } catch (e) {
      console.warn('Lumina local storage sync warning', e);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveVerseToFirestore(
  userId: string,
  verse: BibleVerse
): Promise<void> {
  if (!isFirebaseAuthActive(userId)) return;
  const path = `users/${userId}/saved_verses/${verse.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'saved_verses', verse.id), {
      id: verse.id,
      verseId: verse.id,
      title: verse.reference,
      passageReference: verse.reference,
      category: verse.category,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeVerseFromFirestore(
  userId: string,
  verseId: string
): Promise<void> {
  if (!isFirebaseAuthActive(userId)) return;
  const path = `users/${userId}/saved_verses/${verseId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'saved_verses', verseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserSavedVerses(
  userId: string,
  onUpdate: (verseIds: string[]) => void
): Unsubscribe {
  if (!isFirebaseAuthActive(userId)) {
    return () => {};
  }
  const path = `users/${userId}/saved_verses`;
  return onSnapshot(
    collection(db, 'users', userId, 'saved_verses'),
    (snapshot) => {
      const ids = snapshot.docs.map((d) => d.id);
      onUpdate(ids);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveCustomThemeToFirestore(
  userId: string,
  theme: BackgroundTheme
): Promise<void> {
  if (!isFirebaseAuthActive(userId)) return;
  const path = `users/${userId}/custom_themes/${theme.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'custom_themes', theme.id), {
      id: theme.id,
      name: theme.name,
      imageUrl: theme.imageUrl,
      thumbnailUrl: theme.thumbnailUrl,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomThemeFromFirestore(
  userId: string,
  themeId: string
): Promise<void> {
  if (!isFirebaseAuthActive(userId)) return;
  const path = `users/${userId}/custom_themes/${themeId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'custom_themes', themeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserCustomThemes(
  userId: string,
  onUpdate: (themes: BackgroundTheme[]) => void
): Unsubscribe {
  if (!isFirebaseAuthActive(userId)) {
    return () => {};
  }
  const path = `users/${userId}/custom_themes`;
  return onSnapshot(
    collection(db, 'users', userId, 'custom_themes'),
    (snapshot) => {
      const themes: BackgroundTheme[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id,
          name: data.name,
          category: 'własne',
          imageUrl: data.imageUrl,
          thumbnailUrl: data.thumbnailUrl,
          overlayGradient:
            'linear-gradient(to bottom, rgba(7,9,13,0.45) 0%, rgba(7,9,13,0.85) 100%)',
          attribution: 'Moje wgrane tło',
          mood: 'własny nastrój',
        };
      });
      onUpdate(themes);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
